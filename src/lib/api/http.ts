import axios from "axios";
import { useAuthStore } from "../auth/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL ?? "https://boreal-staff-server.azurewebsites.net";

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
http.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Global error handling
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      const logout = useAuthStore.getState().logout;
      logout();
    }

    return Promise.reject({
      status,
      message: err?.response?.data?.message || err.message,
      raw: err,
    });
  }
);

export default http;
