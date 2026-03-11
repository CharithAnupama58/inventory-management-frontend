import axios from "axios";

/**
 * Central Axios instance
 * All API calls go through here — token injection, error handling,
 * and 401 auto-logout are handled in one place.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/* ── Request Interceptor ─────────────────────────────────────────
   Automatically attaches Bearer token to every request.
   No need to manually add Authorization header anywhere.
──────────────────────────────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response Interceptor ────────────────────────────────────────
   Handles global errors:
   - 401 → token expired/invalid → auto logout
   - 403 → forbidden → redirect to dashboard
   - 500 → server error → log for debugging
──────────────────────────────────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token invalid or expired — clear everything and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (status === 403) {
      // Forbidden — user doesn't have permission
      console.warn("Access forbidden:", error.response?.data?.message);
    }

    if (status >= 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;