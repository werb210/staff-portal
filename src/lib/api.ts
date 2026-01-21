import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";
import { clearAccessToken, getAccessToken } from "@/lib/authToken";

export type ApiErrorOptions = {
  status: number;
  message: string;
  code?: string;
  requestId?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;

  constructor({ status, message, code, requestId, details }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!rawBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const apiBaseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

export const api = axios.create({
  baseURL: apiBaseUrl
});

const shouldBypassAuthRedirect = (url?: string | null) => {
  if (!url) return false;
  return ["/auth/otp/start", "/auth/otp/verify"].some((path) => url.includes(path));
};

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`
    };
  }
  return attachRequestIdAndLog(config);
});

const handleUnauthorized = (url?: string | null) => {
  if (shouldBypassAuthRedirect(url)) return;
  clearAccessToken();
};

api.interceptors.response.use(
  (response: AxiosResponse) => logResponse(response),
  (error: AxiosError) => {
    logError(error);
    const status = error.response?.status ?? 500;
    if (status === 401) {
      handleUnauthorized(error.config?.url);
    }
    return Promise.reject(
      new ApiError({
        status,
        message: error.message,
        code: (error.response?.data as { code?: string })?.code,
        requestId: error.response?.headers?.["x-request-id"],
        details: error.response?.data
      })
    );
  }
);

export default api;
