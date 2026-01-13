import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type GenericAbortSignal
} from "axios";
import { buildApiUrl, redirectToLogin } from "@/services/api";
import {
  clearStoredAuth,
  ACCESS_TOKEN_KEY,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken
} from "@/services/token";
import { reportAuthFailure } from "@/auth/authEvents";
import { setApiStatus } from "@/state/apiStatus";
import { showApiToast } from "@/state/apiNotifications";
import { setLastApiRequest } from "@/state/apiRequestTrace";
import { emitUiTelemetry } from "@/utils/uiTelemetry";

export type ApiErrorPayload = {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
  details?: unknown;
  requestHeaders?: Record<string, string>;
  isAuthError?: boolean;
  isConfigurationError?: boolean;
  isRetryable?: boolean;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;
  requestHeaders?: Record<string, string>;
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
    this.requestHeaders = payload.requestHeaders;
    this.isAuthError = payload.isAuthError ?? false;
    this.isConfigurationError = payload.isConfigurationError ?? false;
    this.isRetryable = payload.isRetryable ?? false;
  }
}

export type RequestOptions = Omit<AxiosRequestConfig, "url" | "method" | "data"> & {
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
  authMode?: "staff" | "lender" | "none";
  suppressAuthFailure?: boolean;
  retryOnConflict?: boolean;
  conflictRetryCount?: number;
  skipIdempotencyKey?: boolean;
  disableTimeout?: boolean;
  disableRouteAbort?: boolean;
};

export const otpRequestOptions: RequestOptions = {
  skipAuth: true,
  authMode: "none",
  retryOnConflict: false,
  withCredentials: true,
  skipIdempotencyKey: true
};

export const otpStartRequestOptions: RequestOptions = {
  ...otpRequestOptions,
  disableTimeout: true,
  disableRouteAbort: true
};

export type LenderAuthTokens = {
  refreshToken: string;
  accessToken: string;
};

type TokenProvider = () => LenderAuthTokens | null;

type TokenUpdater = (tokens: LenderAuthTokens | null) => void;

type LogoutHandler = () => void;

let axiosClient: AxiosInstance | null = null;

const getAccessTokenFromLocalStorage = () => {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

const getAxiosClient = () => {
  if (!axiosClient) {
    axiosClient = axios.create();
    axiosClient.interceptors.request.use((config) => {
      const requestOptions = config as RequestOptions;
      const authMode = requestOptions.authMode ?? "staff";
      const includeAuth = authMode !== "none" && !requestOptions.skipAuth;
      const token = getAccessTokenFromLocalStorage();
      if (includeAuth && token) {
        const headers = config.headers ?? {};
        if (headers instanceof AxiosHeaders) {
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
          }
        } else if (!("Authorization" in headers)) {
          headers.Authorization = `Bearer ${token}`;
        }
        config.headers = headers;
      }
      config.withCredentials = true;
      return config;
    });
  }

  return axiosClient;
};

let routeAbortController = new AbortController();

const getRouteSignal = () => routeAbortController.signal;

export const notifyRouteChange = () => {
  routeAbortController.abort();
  routeAbortController = new AbortController();
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

const buildHeaders = (
  options: RequestOptions = {},
  includeAuth: boolean,
  token?: string,
  body?: unknown,
  method?: AxiosRequestConfig["method"]
) => {
  const headers = new AxiosHeaders(options.headers as AxiosHeaders | Record<string, string> | string | undefined);
  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (includeAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const normalizedMethod = typeof method === "string" ? method.toUpperCase() : undefined;
  const idempotencyMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
  const allowIdempotency = !options.skipIdempotencyKey;
  if (normalizedMethod && idempotencyMethods.has(normalizedMethod) && allowIdempotency && !headers.has("Idempotency-Key")) {
    headers.set("Idempotency-Key", createIdempotencyKey());
  }
  if (normalizedMethod && idempotencyMethods.has(normalizedMethod) && allowIdempotency && !headers.has("Idempotency-Key")) {
    console.warn("Missing Idempotency-Key header.", { method: normalizedMethod });
  }
  if (includeAuth && !headers.has("Authorization")) {
    console.warn("Missing Authorization header for authenticated request.", { method: normalizedMethod });
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

const extractRequestIdFromHeaders = (headers?: AxiosHeaders | Record<string, string>) => {
  if (!headers) return undefined;
  const rawHeaders = headers as Record<string, string | undefined>;
  return rawHeaders["x-request-id"] || rawHeaders["request-id"];
};

const normalizeRequestHeaders = (headers?: AxiosHeaders | Record<string, string>) => {
  if (!headers) return undefined;
  if (headers instanceof AxiosHeaders) {
    if (typeof headers.entries === "function") {
      return Object.fromEntries(headers.entries());
    }
    if (typeof headers.toJSON === "function") {
      return headers.toJSON() as Record<string, string>;
    }
    return Object.fromEntries(
      Object.entries(headers as Record<string, string | undefined>).map(([key, value]) => [
        key,
        value ?? ""
      ])
    );
  }
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, value ?? ""])
  );
};

const getRoutePath = () => {
  if (typeof window === "undefined") return "unknown";
  return window.location.pathname || "unknown";
};

const logApiTelemetry = (payload: { endpoint: string; requestId?: string; status: number }) => {
  console.info("[telemetry] api", { ...payload, route: getRoutePath() });
};

const normalizeErrorMessage = (error: AxiosError, parsed: ApiErrorResponse): string => {
  if (parsed.message) return parsed.message;
  if (typeof error.response?.data === "string" && error.response.data) return error.response.data;
  if (!error.response) return error.message || "Network request failed";
  return error.response.statusText || "Request failed";
};

const toApiError = (error: AxiosError): ApiError => {
  const status = error.response?.status ?? 0;
  const parsed = parseErrorResponse(error.response?.data);
  const message = normalizeErrorMessage(error, parsed);
  const requestId = parsed.requestId || extractRequestId(error);
  const details = error.response?.data ?? error.message;
  const requestHeaders = normalizeRequestHeaders(error.config?.headers as AxiosHeaders | Record<string, string> | undefined);
  const isRetryable = status === 504 || error.code === "ECONNABORTED";
  return new ApiError({
    status,
    message,
    code: parsed.code,
    requestId,
    details,
    requestHeaders,
    isAuthError: status === 401 || status === 403,
    isRetryable
  });
};

const reportApiError = (error: ApiError) => {
  if (error.status >= 400 && error.status < 500 && error.status !== 401 && error.status !== 403) {
    showApiToast(error.message, error.requestId);
  }
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
  const authMode = config.authMode ?? "staff";
  const normalizedMethod = typeof config.method === "string" ? config.method.toUpperCase() : undefined;
  const isOptions = normalizedMethod === "OPTIONS";
  const includeAuth = authMode !== "none" && !config.skipAuth && !isOptions;
  const authToken = authMode === "staff" ? getStoredAccessToken() : lenderTokenProvider()?.accessToken ?? null;

  if (authMode === "staff" && (path === "/auth/me" || path === "/api/auth/me") && !authToken) {
    if (!config.suppressAuthFailure) {
      reportAuthFailure("missing-token");
    }
    redirectToLogin();
    throw new ApiError({ status: 401, message: "Missing access token for /auth/me", isAuthError: true });
  }

  if (includeAuth && authMode === "staff" && !authToken) {
    if (!config.suppressAuthFailure) {
      reportAuthFailure("missing-token");
    }
    redirectToLogin();
    console.warn("Missing Authorization header for staff request.", { path, method: normalizedMethod });
    throw new ApiError({ status: 401, message: "Missing access token", isAuthError: true });
  }

  if (includeAuth && authMode === "lender" && !authToken) {
    lenderUnauthorizedHandler();
    throw new ApiError({ status: 401, message: "Missing lender access token", isAuthError: true });
  }

  const timeout = config.disableTimeout ? null : createTimeoutSignal();
  const routeSignal = config.disableRouteAbort ? undefined : getRouteSignal();
  const signal = combineSignals([config.signal, routeSignal, timeout?.signal]);
  const { retryOnConflict, conflictRetryCount, disableTimeout, disableRouteAbort, ...axiosConfig } = config;
  const requestHeaders = buildHeaders(config, includeAuth, authToken ?? undefined, body, config.method);
  const client = getAxiosClient();
  if (config.adapter && typeof config.adapter !== "function") {
    throw new ApiError({
      status: 0,
      message: "Invalid HTTP adapter configuration",
      isConfigurationError: true
    });
  }
  const previousAdapter = config.adapter ? client.defaults.adapter : undefined;
  if (config.adapter) {
    client.defaults.adapter = config.adapter;
  }

  try {
    const requestConfig: AxiosRequestConfig = {
      ...axiosConfig,
      url: buildApiUrl(path),
      data: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      headers: requestHeaders,
      signal,
      timeout: disableTimeout ? undefined : REQUEST_TIMEOUT_MS,
      validateStatus: (status) => status >= 200 && status < 300
    };
    const response: AxiosResponse<T> = config.adapter
      ? await config.adapter(requestConfig)
      : await client.request<T>(requestConfig);

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError({
        status: response.status,
        message: response.statusText || "Request failed",
        details: response.data,
        isAuthError: response.status === 401 || response.status === 403,
        requestId: (response.data as ApiErrorResponse | undefined)?.requestId,
        requestHeaders: normalizeRequestHeaders(requestHeaders)
      });
    }

    if (isOptions) {
      return response.data;
    }
    const requestId = (response.data as ApiErrorResponse | undefined)?.requestId ?? extractRequestIdFromHeaders(response.headers);
    logApiTelemetry({ endpoint: path, requestId, status: response.status });
    setLastApiRequest({ path, method: normalizedMethod, status: response.status, requestId, timestamp: Date.now() });
    setApiStatus("available");
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    if (isOptions) {
      const status = error instanceof ApiError ? error.status : (error as AxiosError)?.response?.status ?? 0;
      const requestId = error instanceof ApiError ? error.requestId : extractRequestId(error as AxiosError);
      console.error("OPTIONS preflight request failed.", { path, method: normalizedMethod, status, requestId });
      setLastApiRequest({ path, method: normalizedMethod, status, requestId, timestamp: Date.now() });
      return undefined as T;
    }

    if (error instanceof ApiError) {
      if (
        error.status === 409 &&
        (retryOnConflict ?? true) &&
        (conflictRetryCount ?? 0) < 1
      ) {
        return executeRequest<T>(
          path,
          { ...config, conflictRetryCount: (conflictRetryCount ?? 0) + 1 },
          body
        );
      }
      reportApiError(error);
      logApiTelemetry({ endpoint: path, requestId: error.requestId, status: error.status });
      emitUiTelemetry("api_error", { requestId: error.requestId, status: error.status, endpoint: path });
      setLastApiRequest({ path, method: normalizedMethod, status: error.status, requestId: error.requestId, timestamp: Date.now() });
      if (error.status === 401) {
        setApiStatus("unauthorized");
      } else if (error.status === 403) {
        setApiStatus("forbidden");
      } else if (error.status >= 500 || error.status === 0) {
        setApiStatus("unavailable");
      }
      throw error;
    }

    const apiError = toApiError(error as AxiosError);
    if (
      apiError.status === 409 &&
      (retryOnConflict ?? true) &&
      (conflictRetryCount ?? 0) < 1
    ) {
      return executeRequest<T>(
        path,
        { ...config, conflictRetryCount: (conflictRetryCount ?? 0) + 1 },
        body
      );
    }
    reportApiError(apiError);
    logApiTelemetry({ endpoint: path, requestId: apiError.requestId, status: apiError.status });
    emitUiTelemetry("api_error", { requestId: apiError.requestId, status: apiError.status, endpoint: path });
    setLastApiRequest({ path, method: normalizedMethod, status: apiError.status, requestId: apiError.requestId, timestamp: Date.now() });
    if (apiError.status === 401) {
      setApiStatus("unauthorized");
    } else if (apiError.status === 403) {
      setApiStatus("forbidden");
    } else if (apiError.status >= 500 || apiError.status === 0) {
      setApiStatus("unavailable");
    }

    throw apiError;
  } finally {
    if (config.adapter) {
      client.defaults.adapter = previousAdapter;
    }
    timeout?.clear();
  }
};

let lenderTokenProvider: TokenProvider = () => null;
let lenderTokenUpdater: TokenUpdater = () => undefined;
let lenderUnauthorizedHandler: LogoutHandler = () => undefined;
let refreshInFlight: Promise<LenderAuthTokens | null> | null = null;
let staffRefreshInFlight: Promise<{ accessToken: string; refreshToken?: string; user?: unknown } | null> | null = null;

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

const refreshStaffTokens = async (
  adapter?: AxiosRequestConfig["adapter"]
): Promise<{ accessToken: string; refreshToken?: string; user?: unknown } | null> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  if (!staffRefreshInFlight) {
    staffRefreshInFlight = executeRequest<{ accessToken: string; refreshToken?: string; user?: unknown }>(
      "/auth/refresh",
      {
        method: "POST",
        authMode: "none",
        skipAuth: true,
        suppressAuthFailure: true,
        adapter
      },
      { refreshToken }
    )
      .then((body) => {
        if (!body?.accessToken) return null;
        setStoredAccessToken(body.accessToken);
        if (body.refreshToken) {
          setStoredRefreshToken(body.refreshToken);
        }
        return body;
      })
      .catch(() => null)
      .finally(() => {
        staffRefreshInFlight = null;
      });
  }

  return staffRefreshInFlight;
};

const executeStaffRequest = async <T>(path: string, config: RequestOptions & { method: AxiosRequestConfig["method"] }, body?: unknown) => {
  const authMode = config.authMode ?? "staff";
  const hasToken = authMode === "staff" ? !!getStoredAccessToken() : false;
  const shouldSuppress = authMode === "staff" && hasToken && !config.skipAuth;
  const shouldAttemptRefresh = authMode === "staff" && !config.skipAuth && !config.skipAuthRefresh;
  try {
    return await executeRequest<T>(path, { ...config, authMode, suppressAuthFailure: shouldSuppress }, body);
  } catch (error) {
    if (error instanceof ApiError && error.isAuthError && shouldAttemptRefresh) {
      if (error.status === 401 && shouldSuppress) {
        const refreshed = await refreshStaffTokens(config.adapter);
        if (refreshed?.accessToken) {
          try {
            return await executeRequest<T>(path, { ...config, authMode: "staff" }, body);
          } catch (retryError) {
            if (retryError instanceof ApiError && retryError.status === 401) {
              clearStoredAuth();
              reportAuthFailure("unauthorized");
            }
            throw retryError;
          }
        }
        clearStoredAuth();
        reportAuthFailure("unauthorized");
      } else if (shouldSuppress && error.status === 401) {
        clearStoredAuth();
        reportAuthFailure("unauthorized");
      }
    }
    throw error;
  }
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
  get: <T>(path: string, options: RequestOptions = {}) => executeStaffRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeStaffRequest<T>(path, { ...options, method: "POST" }, body),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeStaffRequest<T>(path, { ...options, method: "PATCH" }, body),
  delete: <T>(path: string, options: RequestOptions = {}) => executeStaffRequest<T>(path, { ...options, method: "DELETE" }),
  options: <T>(path: string, options: RequestOptions = {}) =>
    executeStaffRequest<T>(path, { ...options, method: "OPTIONS", skipAuth: true }, undefined)
};

export const setAxiosAdapterForTests = (adapter?: AxiosRequestConfig["adapter"]) => {
  const client = getAxiosClient();
  client.defaults.adapter = adapter;
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
