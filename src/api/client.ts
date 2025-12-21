import axios, { type AxiosRequestConfig } from "axios";
import { clearStoredAccessToken, getStoredAccessToken } from "@/services/token";

export const API_BASE = import.meta.env.VITE_API_BASE;

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

type AuthenticatedRequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

const token = getStoredAccessToken();
if (token) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

apiClient.interceptors.request.use((config: AuthenticatedRequestConfig) => {
  if (config.skipAuth) return config;

  const storedToken = getStoredAccessToken();
  if (storedToken) {
    const headers = config.headers ?? {};
    return {
      ...config,
      headers: { ...headers, Authorization: `Bearer ${storedToken}` }
    } as AuthenticatedRequestConfig;
  }

  return config;
});

apiClient.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      clearStoredAccessToken();
      delete apiClient.defaults.headers.common.Authorization;
    }
    return Promise.reject(err);
  }
);
