import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { buildApiUrl } from "@/services/api";
import {
  getStoredAccessToken,
  clearStoredAuth,
} from "@/services/token";
import { reportAuthFailure } from "@/auth/authEvents";

const api: AxiosInstance = axios.create({
  baseURL: buildApiUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const token = getStoredAccessToken();

    /**
     * HARD RULE:
     * - 401 does NOT mean redirect unless token is missing or invalid
     * - Capability failures are NOT auth failures
     */
    if (status === 401 && !token) {
      clearStoredAuth();
      reportAuthFailure("missing_token");
    }

    return Promise.reject(error);
  }
);

export default api;
