import axios, { AxiosError } from "axios";
import { getAccessToken, clearTokens } from "./auth";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/**
 * Configured Axios instance. Reused everywhere.
 * Java analogy: like an `@Autowired` RestTemplate with defaults baked in.
 */
export const api = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/* ---------------- Request interceptor ---------------- */
// Attaches the JWT to every request if we have one.
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

/* ---------------- Response interceptor ---------------- */
// Future: handle 401 (clear tokens + redirect to /login).
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — wipe and let the page handle redirect.
      clearTokens();
    }
    return Promise.reject(error);
  }
);
