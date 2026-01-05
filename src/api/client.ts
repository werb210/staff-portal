import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { RUNTIME_ENV } from "@/config/runtime";
import { buildApiUrl, redirectToLogin } from "@/services/api";
import { clearStoredAccessToken, getStoredAccessToken } from "@/services/token";

export const API_BASE = RUNTIME_ENV.API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & { skipAuth?: boolean };

const token = getStoredAccessToken();
if (token) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

apiClient.interceptors.request.use((config: AuthenticatedRequestConfig) => {
  const configWithUrl: AuthenticatedRequestConfig = {
    ...config,
    url: buildApiUrl(config.url ?? "")
  };

  if (configWithUrl.skipAuth) return configWithUrl;

  const storedToken = getStoredAccessToken();
  if (!storedToken) {
    redirectToLogin();
    return Promise.reject(new Error("Missing access token"));
  }

  const headers = AxiosHeaders.from(configWithUrl.headers);
  headers.set("Authorization", `Bearer ${storedToken}`);

  return {
    ...configWithUrl,
    headers
  };
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
