/**
 * Token storage helpers.
 *
 * For now we use localStorage. It's the simplest portfolio choice.
 *
 * INTERVIEW NOTE: For production banking apps the safer choice is
 * httpOnly cookies (Set-Cookie from backend). localStorage is readable
 * by any script and vulnerable to XSS. We'll discuss the trade-off when
 * you interview at ABA / ACLEDA.
 */

const ACCESS_TOKEN_KEY = "ec_access_token";
const REFRESH_TOKEN_KEY = "ec_refresh_token";

// All localStorage calls must guard against SSR (window doesn't exist on server).
const isBrowser = typeof window !== "undefined";

export function saveTokens(access: string, refresh: string): void {
  if (!isBrowser) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
