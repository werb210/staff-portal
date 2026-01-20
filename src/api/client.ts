import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getStoredAccessToken, clearStoredAuth } from "@/services/token";
import { redirectToLogin } from "@/services/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getStoredAccessToken();
  const skipAuth = (config as any)?.skipAuth;
  if (token && !skipAuth) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      clearStoredAuth();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        redirectToLogin();
      }
    }
    return Promise.reject(err);
  }
);

export default api;
