import axios from "axios";

import { authStore } from "./auth.store";

export const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

authClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
