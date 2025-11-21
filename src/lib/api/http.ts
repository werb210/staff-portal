import axios from "axios";
import { TOKEN_STORAGE_KEY, useAuthStore } from "../auth/useAuthStore";

// Azure Staff Server URL
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.warn("VITE_API_URL is missing in .env");
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject auth token automatically
api.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState().token || localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize errors + auto-logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      // Token expired → wipe local session
      useAuthStore.getState().logout();
    }

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error";

    return Promise.reject(new Error(message));
  }
);

export default api;
