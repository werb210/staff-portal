import axios, { type AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getStoredAccessToken, clearStoredAuth } from "@/services/token";
import { redirectToLogin } from "@/services/api";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";

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
  return attachRequestIdAndLog(config);
});

api.interceptors.response.use(
  (res: AxiosResponse) => logResponse(res),
  (err) => {
    logError(err as AxiosError);
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      clearStoredAuth();
      if (typeof window !== "undefined") {
        const isOnLogin = window.location.pathname.startsWith("/login");
        if (!isOnLogin) {
          redirectToLogin();
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
