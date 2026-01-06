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
  message: string;
  details?: unknown;
  isAuthError?: boolean;
  isConfigurationError?: boolean;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  isAuthError: boolean;
  isConfigurationError: boolean;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.details = payload.details;
    this.isAuthError = payload.isAuthError ?? false;
    this.isConfigurationError = payload.isConfigurationError ?? false;
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

const buildHeaders = (options: RequestOptions = {}, includeAuth: boolean, token?: string, body?: unknown) => {
  const headers = new AxiosHeaders(options.headers as AxiosHeaders | Record<string, string> | string | undefined);
  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (includeAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

const normalizeErrorMessage = (error: AxiosError): string => {
  const responseData = error.response?.data as { message?: string } | string | undefined;
  if (typeof responseData === "string" && responseData) return responseData;
  if (responseData && typeof responseData === "object" && responseData.message) return responseData.message;
  return error.response?.statusText || "Request failed";
};

const toApiError = (error: AxiosError): ApiError => {
  const status = error.response?.status ?? 0;
  const message = normalizeErrorMessage(error);
  const details = error.response?.data ?? error.message;
  return new ApiError({
    status,
    message,
    details,
    isAuthError: status === 401 || status === 403
  });
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

  const signal = combineSignals([config.signal, getRouteSignal()]);

  try {
    const response = await getAxiosClient().request<T>({
      ...config,
      url: buildApiUrl(path),
      data: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      headers: buildHeaders(config, includeAuth, authToken ?? undefined, body),
      signal,
      validateStatus: (status) => status >= 200 && status < 300
    });

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError({
        status: response.status,
        message: response.statusText || "Request failed",
        details: response.data,
        isAuthError: response.status === 401 || response.status === 403
      });
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.isAuthError && authMode === "staff" && includeAuth) {
        reportAuthFailure(error.status === 403 ? "forbidden" : "unauthorized");
      }
      throw error;
    }

    const apiError = toApiError(error as AxiosError);

    if (apiError.isAuthError && authMode === "staff" && includeAuth) {
      reportAuthFailure(apiError.status === 403 ? "forbidden" : "unauthorized");
    }

    throw apiError;
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
