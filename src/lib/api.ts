import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";
import { clearAuth, getAccessToken } from "@/lib/authStorage";
import { getApiBaseUrl } from "@/config/api";
import { reportAuthFailure } from "@/auth/authEvents";
import { showApiToast } from "@/state/apiNotifications";

const redirectTo = (path: string) => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === path) return;
  const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  if (isTestEnv) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  window.location.assign(path);
};

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

const resolveErrorData = (error: AxiosError): { code?: string; details?: unknown; message?: string } => {
  try {
    const data = error.response?.data as { message?: string; code?: string } | undefined;
    return {
      code: data?.code,
      details: data,
      message: data?.message
    };
  } catch {
    return {
      code: undefined,
      details: undefined,
      message: undefined
    };
  }
};

const rawBaseUrl = getApiBaseUrl();
const testBaseUrl = typeof process !== "undefined" && process.env?.NODE_ENV === "test" ? "http://localhost" : "";
const resolvedBaseUrl = rawBaseUrl || testBaseUrl;
const apiBaseUrl = resolvedBaseUrl.endsWith("/api") ? resolvedBaseUrl : `${resolvedBaseUrl}/api`;

export type AuthRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipRequestId?: boolean;
};
type AuthRequestInternalConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  skipRequestId?: boolean;
};

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<T>(config);
    const data = response.data as T;

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    const errorData = resolveErrorData(axiosError);
    const status = axiosError.response?.status ?? 500;
    const message = errorData.message ?? axiosError.message;

    throw new ApiError({
      status,
      message,
      code: errorData.code,
      requestId: axiosError.response?.headers?.["x-request-id"],
      details: errorData.details
    });
  }
}

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
  clearAuth();
  reportAuthFailure("unauthorized");
  redirectTo("/login");
};

api.interceptors.response.use(
  (response: AxiosResponse) => logResponse(response),
  (error: AxiosError) => {
    logError(error);
    const errorData = resolveErrorData(error);
    const status = error.response?.status ?? 500;
    if (status === 401) {
      handleUnauthorized(error.config?.url);
    } else if (status === 403) {
      reportAuthFailure("forbidden");
      redirectTo("/unauthorized");
    } else if (!error.response) {
      showApiToast("Network error. Please check your connection and try again.");
    } else if (status >= 500) {
      showApiToast("We hit a server issue. Please retry in a moment.", error.response?.headers?.["x-request-id"]);
    }
    return Promise.reject(
      new ApiError({
        status,
        message: errorData.message ?? error.message,
        code: errorData.code,
        requestId: error.response?.headers?.["x-request-id"],
        details: errorData.details
      })
    );
  }
);

export default api;
