import axios from "axios";

// Base URL read from .env.local — single source of truth.
// Falls back to localhost so the app still works if env is missing.
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// Create a configured Axios instance.
// Using an instance (not the global axios) lets us attach interceptors
// without polluting other parts of the app.
export const api = axios.create({
  baseURL,
  timeout: 10_000, // 10s — fail fast instead of hanging forever
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request interceptor ----
// Runs BEFORE every request. We'll attach the JWT here later.
// For now it's a no-op so you can see where the logic goes.
api.interceptors.request.use(
  (config) => {
    // TODO: attach Bearer token once we have login working
    // const token = localStorage.getItem("access_token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor ----
// Runs AFTER every response. Two jobs:
//  1. Unwrap the backend's { payload, message, code, error } envelope
//  2. Surface errors in a consistent way
api.interceptors.response.use(
  (response) => response, // pass-through for now; we'll unwrap later
  (error) => {
    // Network down, timeout, 5xx, 4xx — all land here.
    // Log for now; later we'll route 401 → redirect to /login.
    console.error("[api] error:", error.message);
    return Promise.reject(error);
  }
);
