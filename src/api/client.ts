import axios, { type AxiosRequestConfig } from "axios";
import { buildApiUrl, redirectToLogin } from "@/services/api";
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
  const configWithUrl = {
    ...config,
    url: buildApiUrl(config.url ?? "")
  } as AuthenticatedRequestConfig;

  if (config.skipAuth) return configWithUrl;

  const storedToken = getStoredAccessToken();
  if (!storedToken) {
    redirectToLogin();
    return Promise.reject(new Error("Missing access token"));
  }

  const headers = config.headers ?? {};
  return {
    ...configWithUrl,
    headers: { ...headers, Authorization: `Bearer ${storedToken}` }
  } as AuthenticatedRequestConfig;
});

apiClient.interceptors.response.use(
  response => {
    if (response.status === 401) {
      clearStoredAccessToken();
      delete apiClient.defaults.headers.common.Authorization;
      redirectToLogin();
      return Promise.reject(new Error("Unauthorized"));
    }

    return response;
  },
  err => {
    if (err.response?.status === 401) {
      clearStoredAccessToken();
      delete apiClient.defaults.headers.common.Authorization;
      redirectToLogin();
    }
    return Promise.reject(err);
  }
);

export default apiClient;
