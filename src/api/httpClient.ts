import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { ApiError, api } from "@/api/http";
import { reportAuthFailure } from "@/auth/authEvents";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";
import { getAccessToken } from "@/lib/authToken";

export type RequestOptions = AxiosRequestConfig & {
  skipAuth?: boolean;
};

export type ListResponse<T> = {
  items: T[];
} & Record<string, unknown>;

const generateIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idempotency_${Math.random().toString(36).slice(2, 10)}`;
};

const buildConfig = (
  options?: RequestOptions,
  { idempotent = false }: { idempotent?: boolean } = {}
): RequestOptions | undefined => {
  const config = options ?? {};
  if (config.skipAuth || !idempotent) return config;
  const headers = {
    ...(config.headers ?? {}),
    "Idempotency-Key": generateIdempotencyKey(),
    "Content-Type": "application/json"
  } as Record<string, string>;
  return {
    ...config,
    headers
  };
};

const ensureAccessToken = (options?: RequestOptions) => {
  if (options?.skipAuth) return;
  const token = getAccessToken();
  if (!token) {
    reportAuthFailure("missing-token");
    throw new ApiError({
      status: 401,
      message: "Missing auth token",
      details: { reason: "missing-token" }
    });
  }
};

const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      reportAuthFailure("unauthorized");
    } else if (error.status === 403) {
      reportAuthFailure("forbidden");
    }
  }
  throw error;
};

export const apiClient = {
  get: async <T>(path: string, options?: RequestOptions) => {
    try {
      ensureAccessToken(options);
      const response = await api.get<T>(path, buildConfig(options));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  post: async <T>(path: string, data?: unknown, options?: RequestOptions) => {
    try {
      ensureAccessToken(options);
      const response = await api.post<T>(path, data, buildConfig(options, { idempotent: true }));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  put: async <T>(path: string, data?: unknown, options?: RequestOptions) => {
    try {
      ensureAccessToken(options);
      const response = await api.put<T>(path, data, buildConfig(options, { idempotent: true }));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  patch: async <T>(path: string, data?: unknown, options?: RequestOptions) => {
    try {
      ensureAccessToken(options);
      const response = await api.patch<T>(path, data, buildConfig(options, { idempotent: true }));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async <T>(path: string, options?: RequestOptions) => {
    try {
      ensureAccessToken(options);
      const response = await api.delete<T>(path, buildConfig(options, { idempotent: true }));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  getList: async <T>(path: string, options?: RequestOptions): Promise<ListResponse<T>> => {
    try {
      ensureAccessToken(options);
      const response = await api.get<ListResponse<T>>(path, buildConfig(options));
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

export default apiClient;

export type LenderAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type LenderAuthConfig = {
  tokenProvider: () => LenderAuthTokens | null;
  onTokensUpdated?: (tokens: LenderAuthTokens | null) => void;
  onUnauthorized?: () => void;
};

let lenderAuthConfig: LenderAuthConfig = {
  tokenProvider: () => null
};

export const configureLenderApiClient = (config: LenderAuthConfig) => {
  lenderAuthConfig = config;
};

const lenderApiBaseURL = api.defaults.baseURL;
const lenderApi = axios.create({
  baseURL: lenderApiBaseURL
});

lenderApi.interceptors.request.use((config: AxiosRequestConfig) => attachRequestIdAndLog(config));
lenderApi.interceptors.response.use(
  (response) => logResponse(response),
  (error: AxiosError) => {
    logError(error);
    return Promise.reject(error);
  }
);

const buildLenderConfig = (options?: RequestOptions): AxiosRequestConfig | undefined => {
  if (!options) {
    const tokens = lenderAuthConfig.tokenProvider();
    if (!tokens?.accessToken) return undefined;
    return {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    };
  }
  const { skipAuth, ...config } = options;
  if (skipAuth) return config;
  const tokens = lenderAuthConfig.tokenProvider();
  if (!tokens?.accessToken) return config;
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${tokens.accessToken}`
    }
  };
};

const handleLenderError = (error: AxiosError) => {
  const status = error.response?.status ?? 500;
  const apiError = new ApiError({
    status,
    message: error.message,
    code: (error.response?.data as { code?: string })?.code,
    requestId: error.response?.headers?.["x-request-id"],
    details: error.response?.data
  });
  if (status === 401) {
    lenderAuthConfig.onUnauthorized?.();
  }
  throw apiError;
};

export const lenderApiClient = {
  get: async <T>(path: string, options?: RequestOptions) => {
    try {
      const response = await lenderApi.get<T>(path, buildLenderConfig(options));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        handleLenderError(error);
      }
      throw error;
    }
  },
  post: async <T>(path: string, data?: unknown, options?: RequestOptions) => {
    try {
      const response = await lenderApi.post<T>(path, data, buildLenderConfig(options));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        handleLenderError(error);
      }
      throw error;
    }
  },
  put: async <T>(path: string, data?: unknown, options?: RequestOptions) => {
    try {
      const response = await lenderApi.put<T>(path, data, buildLenderConfig(options));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        handleLenderError(error);
      }
      throw error;
    }
  },
  patch: async <T>(path: string, data?: unknown, options?: RequestOptions) => {
    try {
      const response = await lenderApi.patch<T>(path, data, buildLenderConfig(options));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        handleLenderError(error);
      }
      throw error;
    }
  },
  delete: async <T>(path: string, options?: RequestOptions) => {
    try {
      const response = await lenderApi.delete<T>(path, buildLenderConfig(options));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        handleLenderError(error);
      }
      throw error;
    }
  }
};
