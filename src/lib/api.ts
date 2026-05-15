import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/* ------------------------------------------------------------------ *
 * Token refresh helpers                                               *
 *                                                                     *
 * Multiple in-flight requests can all fail with UNAUTHORIZED at once. *
 * We handle this with a queue: the first failure starts the refresh,  *
 * subsequent ones wait in line, then all retry once we have a new     *
 * access token (or all bail to /login if refresh fails).             *
 * ------------------------------------------------------------------ */

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  refreshQueue = [];
}

async function doRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("no_refresh_token");

  // Refresh endpoint writes AuthenticationResponse directly (no BaseResponse wrapper).
  // The refresh token goes as the Bearer in Authorization, body is empty.
  const res = await axios.post<{ access_token: string; refresh_token: string }>(
    `${baseURL}/auth/refresh-token`,
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  );

  const { access_token, refresh_token } = res.data;
  if (!access_token) throw new Error("refresh_returned_no_token");

  saveTokens(access_token, refresh_token ?? refreshToken);
  return access_token;
}

function kickToLogin() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}

/* ------------------------------------------------------------------ *
 * Shared retry logic — used by both success and error interceptors.  *
 * ------------------------------------------------------------------ */
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enqueueRetry(config: RetryableConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  }).then((newToken) => {
    config.headers.Authorization = `Bearer ${newToken}`;
    return api(config);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refreshAndRetry(config: RetryableConfig): Promise<any> {
  config._retry = true;
  isRefreshing = true;
  try {
    const newToken = await doRefresh();
    drainQueue(null, newToken);
    config.headers.Authorization = `Bearer ${newToken}`;
    return api(config);
  } catch (err) {
    drainQueue(err, null);
    kickToLogin();
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
}

/* ------------------------------------------------------------------ *
 * Request interceptor — attach access token to every request         *
 * ------------------------------------------------------------------ */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------------------------------------------ *
 * Response interceptor                                                *
 *                                                                     *
 * Two UNAUTHORIZED shapes to handle:                                  *
 *   1. HTTP 401 — standard unauthorized                               *
 *   2. HTTP 200 with { error: true, message: "UNAUTHORIZED" } —      *
 *      the backend wraps errors in BaseResponse even for auth issues. *
 * ------------------------------------------------------------------ */
api.interceptors.response.use(
  async (response) => {
    const data = response.data as { error?: boolean; message?: string } | null;
    const isAppUnauthorized =
      data?.error === true &&
      typeof data?.message === "string" &&
      data.message.toUpperCase() === "UNAUTHORIZED";

    if (!isAppUnauthorized) return response;

    const config = response.config as RetryableConfig;
    if (config._retry) {
      kickToLogin();
      return Promise.reject(new Error("UNAUTHORIZED"));
    }

    if (isRefreshing) return enqueueRetry(config);
    return refreshAndRetry(config);
  },
  async (error: AxiosError) => {
    if (error.response?.status !== 401) return Promise.reject(error);

    const config = error.config as RetryableConfig | undefined;
    if (!config || config._retry) {
      kickToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) return enqueueRetry(config);
    return refreshAndRetry(config);
  }
);
