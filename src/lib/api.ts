import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";
import { getAccessToken } from "@/lib/authToken";
import { getApiBaseUrl } from "@/config/api";
import { reportAuthFailure } from "@/auth/authEvents";
import { showApiToast } from "@/state/apiNotifications";

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

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || getApiBaseUrl();
const apiBaseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

export type AuthRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipRequestId?: boolean;
};
type AuthRequestInternalConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  skipRequestId?: boolean;
};

export const api = axios.create({
  baseURL: apiBaseUrl
});

const shouldBypassAuthRedirect = (url?: string | null) => {
  if (!url) return false;
  return ["/auth/otp/start", "/auth/otp/verify"].some((path) => url.includes(path));
};

api.interceptors.request.use((config: AuthRequestInternalConfig) => {
  if (!config.skipAuth && !shouldBypassAuthRedirect(config.url)) {
    const token = getAccessToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
  }
  return attachRequestIdAndLog(config);
});

const handleUnauthorized = (url?: string | null) => {
  if (shouldBypassAuthRedirect(url)) return;
  reportAuthFailure("unauthorized");
};

api.interceptors.response.use(
  (response: AxiosResponse) => logResponse(response),
  (error: AxiosError) => {
    logError(error);
    const status = error.response?.status ?? 500;
    if (status === 401) {
      handleUnauthorized(error.config?.url);
    } else if (status === 403) {
      reportAuthFailure("forbidden");
    } else if (status >= 500) {
      showApiToast("We hit a server issue. Please retry in a moment.", error.response?.headers?.["x-request-id"]);
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
