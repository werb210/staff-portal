// src/lib/api.ts
// Global Axios client with token injection + 401 handling

import axios from "axios";
import { useAuthStore } from "../state/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

// REQUEST → attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// RESPONSE → auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const logout = useAuthStore.getState().logout;
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
