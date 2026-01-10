import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type GenericAbortSignal
} from "axios";
import { getApiBaseUrlOptional } from "@/config/runtime";
import { buildApiUrl } from "@/services/api";
import { getStoredAccessToken } from "@/services/token";
import { reportAuthFailure } from "@/auth/authEvents";

export type ApiErrorPayload = {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
  details?: unknown;
  isAuthError?: boolean;
  isConfigurationError?: boolean;
  isRetryable?: boolean;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;
  isAuthError: boolean;
  isConfigurationError: boolean;
  isRetryable: boolean;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.requestId = payload.requestId;
    this.details = payload.details;
    this.isAuthError = payload.isAuthError ?? false;
    this.isConfigurationError = payload.isConfigurationError ?? false;
    this.isRetryable = payload.isRetryable ?? false;
  }
}

export type RequestOptions = Omit<AxiosRequestConfig, "url" | "method" | "data"> & {
  skipAuth?: boolean;
  authMode?: "staff" | "lender" | "none";
};

export type LenderAuthTokens = {
  refreshToken: string;
  accessToken: string;
};

type TokenProvider = () => LenderAuthTokens | null;

type TokenUpdater = (tokens: LenderAuthTokens | null) => void;

type LogoutHandler = () => void;

let axiosClient: AxiosInstance | null = null;

const getAxiosClient = () => {
  if (!axiosClient) {
    axiosClient = axios.create();
  }

  return axiosClient;
};

let routeAbortController = new AbortController();

const getRouteSignal = () => routeAbortController.signal;

export const notifyRouteChange = () => {
  routeAbortController.abort();
  routeAbortController = new AbortController();
};

const ensureApiBaseUrl = () => {
  if (!getApiBaseUrlOptional()) {
    throw new ApiError({
      status: 0,
      message: "Missing VITE_API_BASE_URL. Please configure VITE_API_BASE_URL before using the staff portal.",
      isConfigurationError: true
    });
  }
};

const REQUEST_TIMEOUT_MS = 10_000;

const combineSignals = (signals: Array<GenericAbortSignal | undefined>) => {
  const activeSignals = signals.filter(Boolean) as GenericAbortSignal[];
  if (!activeSignals.length) return undefined;
  if (activeSignals.length === 1) return activeSignals[0];

  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
    activeSignals.forEach((signal) => signal.removeEventListener?.("abort", onAbort));
  };

  activeSignals.forEach((signal) => {
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener?.("abort", onAbort);
    }
  });

  return controller.signal as GenericAbortSignal;
};

const createTimeoutSignal = () => {
  const controller = new AbortController();
  const timer = typeof window !== "undefined" ? window : globalThis;
  const timeoutId = timer.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  return {
    signal: controller.signal,
    clear: () => timer.clearTimeout(timeoutId)
  };
};

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = Math.random() * 16;
    const value = char === "x" ? rand : (rand % 4) + 8;
    return Math.floor(value).toString(16);
  });
};

const buildHeaders = (options: RequestOptions = {}, includeAuth: boolean, token?: string, body?: unknown) => {
  const headers = new AxiosHeaders(options.headers as AxiosHeaders | Record<string, string> | string | undefined);
  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (includeAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Idempotency-Key")) {
    headers.set("Idempotency-Key", createIdempotencyKey());
  }
  return headers;
};

type ApiErrorResponse = {
  code?: string;
  message?: string;
  requestId?: string;
};

const parseErrorResponse = (data: unknown): ApiErrorResponse => {
  if (!data) return {};
  if (typeof data === "string") return { message: data };
  if (typeof data === "object") {
    const payload = data as ApiErrorResponse;
    if (payload.code || payload.message || payload.requestId) {
      return payload;
    }
    if ("error" in payload && typeof (payload as { error?: ApiErrorResponse }).error === "object") {
      const nested = (payload as { error?: ApiErrorResponse }).error;
      if (nested?.code || nested?.message || nested?.requestId) {
        return nested;
      }
    }
  }
  return {};
};

const extractRequestId = (error: AxiosError | { response?: { headers?: Record<string, string> } }) => {
  const headerValue = error.response?.headers?.["x-request-id"] || error.response?.headers?.["request-id"];
  return typeof headerValue === "string" ? headerValue : undefined;
};

const normalizeErrorMessage = (error: AxiosError, parsed: ApiErrorResponse): string => {
  if (parsed.message) return parsed.message;
  if (typeof error.response?.data === "string" && error.response.data) return error.response.data;
  return error.response?.statusText || "Request failed";
};

const toApiError = (error: AxiosError): ApiError => {
  const status = error.response?.status ?? 0;
  const parsed = parseErrorResponse(error.response?.data);
  const message = normalizeErrorMessage(error, parsed);
  const requestId = parsed.requestId || extractRequestId(error);
  const details = error.response?.data ?? error.message;
  const isRetryable = status === 504 || error.code === "ECONNABORTED";
  return new ApiError({
    status,
    message,
    code: parsed.code,
    requestId,
    details,
    isAuthError: status === 401 || status === 403,
    isRetryable
  });
};

const reportApiError = (error: ApiError) => {
  if (error.status === 400 && error.code === "missing_idempotency_key") {
    console.error("Missing Idempotency-Key in request.", { requestId: error.requestId, code: error.code });
    return;
  }

  if (error.status === 401) {
    console.warn("Unauthorized response from server.", { message: error.message, requestId: error.requestId });
    return;
  }

  if (error.status === 409) {
    console.warn("Conflict response from server.", { message: error.message, requestId: error.requestId });
    return;
  }

  if (error.status === 503) {
    console.warn("Backend not ready.", { message: error.message, requestId: error.requestId });
    return;
  }

  if (error.status === 504 || error.isRetryable) {
    console.warn("Request timed out. Safe to retry.", { message: error.message, requestId: error.requestId });
    return;
  }

  console.warn("API request failed.", { message: error.message, requestId: error.requestId, code: error.code });
};

const executeRequest = async <T>(path: string, config: RequestOptions & { method: AxiosRequestConfig["method"] }, body?: unknown) => {
  ensureApiBaseUrl();

  const authMode = config.authMode ?? "staff";
  const includeAuth = authMode !== "none" && !config.skipAuth;
  const authToken = authMode === "staff" ? getStoredAccessToken() : lenderTokenProvider()?.accessToken ?? null;

  if (includeAuth && authMode === "staff" && !authToken) {
    reportAuthFailure("missing-token");
    throw new ApiError({ status: 401, message: "Missing access token", isAuthError: true });
  }

  if (includeAuth && authMode === "lender" && !authToken) {
    lenderUnauthorizedHandler();
    throw new ApiError({ status: 401, message: "Missing lender access token", isAuthError: true });
  }

  const timeout = createTimeoutSignal();
  const signal = combineSignals([config.signal, getRouteSignal(), timeout.signal]);

  try {
    const response = await getAxiosClient().request<T>({
      ...config,
      url: buildApiUrl(path),
      data: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      headers: buildHeaders(config, includeAuth, authToken ?? undefined, body),
      signal,
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: (status) => status >= 200 && status < 300
    });

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError({
        status: response.status,
        message: response.statusText || "Request failed",
        details: response.data,
        isAuthError: response.status === 401 || response.status === 403,
        requestId: (response.data as ApiErrorResponse | undefined)?.requestId
      });
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      reportApiError(error);
      if (error.isAuthError && authMode === "staff" && includeAuth) {
        reportAuthFailure(error.status === 403 ? "forbidden" : "unauthorized");
      }
      throw error;
    }

    const apiError = toApiError(error as AxiosError);
    reportApiError(apiError);

    if (apiError.isAuthError && authMode === "staff" && includeAuth) {
      reportAuthFailure(apiError.status === 403 ? "forbidden" : "unauthorized");
    }

    throw apiError;
  } finally {
    timeout.clear();
  }
};

let lenderTokenProvider: TokenProvider = () => null;
let lenderTokenUpdater: TokenUpdater = () => undefined;
let lenderUnauthorizedHandler: LogoutHandler = () => undefined;
let refreshInFlight: Promise<LenderAuthTokens | null> | null = null;

export const configureLenderApiClient = (options: {
  tokenProvider: TokenProvider;
  onTokensUpdated: TokenUpdater;
  onUnauthorized: LogoutHandler;
}) => {
  lenderTokenProvider = options.tokenProvider;
  lenderTokenUpdater = options.onTokensUpdated;
  lenderUnauthorizedHandler = options.onUnauthorized;
};

const refreshLenderTokens = async (): Promise<LenderAuthTokens | null> => {
  const tokens = lenderTokenProvider();
  if (!tokens?.refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = executeRequest<{ accessToken: string; refreshToken?: string }>(
      "/lender/auth/refresh",
      {
        method: "POST",
        authMode: "none"
      },
      { refreshToken: tokens.refreshToken }
    )
      .then((body) => {
        const nextTokens: LenderAuthTokens = {
          accessToken: body.accessToken,
          refreshToken: body.refreshToken ?? tokens.refreshToken
        };
        lenderTokenUpdater(nextTokens);
        return nextTokens;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

const executeLenderRequest = async <T>(path: string, config: RequestOptions & { method: AxiosRequestConfig["method"] }, body?: unknown) => {
  try {
    return await executeRequest<T>(path, { ...config, authMode: "lender" }, body);
  } catch (error) {
    if (error instanceof ApiError && error.isAuthError && !config.skipAuth) {
      if (error.status === 401) {
        const refreshed = await refreshLenderTokens();
        if (refreshed?.accessToken) {
          return executeRequest<T>(path, { ...config, authMode: "lender" }, body);
        }
      }
      lenderUnauthorizedHandler();
    }
    throw error;
  }
};

export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}) => executeRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: "POST" }, body),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: "PATCH" }, body),
  delete: <T>(path: string, options: RequestOptions = {}) => executeRequest<T>(path, { ...options, method: "DELETE" })
};

export const lenderApiClient = {
  get: <T>(path: string, options: RequestOptions = {}) => executeLenderRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeLenderRequest<T>(path, { ...options, method: "POST" }, body),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeLenderRequest<T>(path, { ...options, method: "PATCH" }, body),
  delete: <T>(path: string, options: RequestOptions = {}) =>
    executeLenderRequest<T>(path, { ...options, method: "DELETE" })
};

export default apiClient;
