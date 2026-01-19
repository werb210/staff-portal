import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { api } from "./client";

export type RequestOptions = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
};

export type ListResponse<T> = {
  items: T[];
};

type ApiErrorOptions = {
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

const unwrap = async <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  const response = await promise;
  return response.data;
};

const stripApiSuffix = (baseUrl: string | undefined) => {
  if (!baseUrl) return undefined;
  return baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;
};

const normalizePath = (path: string) => {
  let normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/health") {
    return { url: normalized, baseURL: stripApiSuffix(api.defaults.baseURL) };
  }
  if (normalized.startsWith("/api/")) {
    normalized = normalized.replace(/^\/api/, "");
  }
  return { url: normalized, baseURL: undefined };
};

const request = <T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  options?: RequestOptions
) => {
  const { url: normalizedUrl, baseURL } = normalizePath(url);
  return unwrap(
    api.request<T>({
      ...options,
      method,
      url: normalizedUrl,
      ...(data !== undefined ? { data } : {}),
      ...(baseURL ? { baseURL } : {})
    })
  );
};

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) => request<T>("get", url, undefined, options),
  getList: <T>(url: string, options?: RequestOptions) => request<ListResponse<T>>("get", url, undefined, options),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) => request<T>("post", url, data, options),
  put: <T>(url: string, data?: unknown, options?: RequestOptions) => request<T>("put", url, data, options),
  patch: <T>(url: string, data?: unknown, options?: RequestOptions) => request<T>("patch", url, data, options),
  delete: <T>(url: string, options?: RequestOptions) => request<T>("delete", url, undefined, options)
};

export type LenderAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type LenderApiConfig = {
  tokenProvider?: () => LenderAuthTokens | null;
  onTokensUpdated?: (tokens: LenderAuthTokens | null) => void;
  onUnauthorized?: () => void;
};

let lenderApiConfig: LenderApiConfig = {};

export const configureLenderApiClient = (config: LenderApiConfig) => {
  lenderApiConfig = config;
};

const lenderApiBaseUrl = api.defaults.baseURL;
if (!lenderApiBaseUrl) {
  throw new Error("API base URL is not configured for lender client");
}

const lenderApi = axios.create({
  baseURL: lenderApiBaseUrl,
});

lenderApi.interceptors.request.use(config => {
  if (config.skipAuth) {
    return config;
  }
  const tokens = lenderApiConfig.tokenProvider?.() ?? null;
  if (tokens?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

lenderApi.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    if (status === 401) {
      lenderApiConfig.onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);

export const lenderApiClient = {
  get: <T>(url: string, options?: RequestOptions) => unwrap(lenderApi.get<T>(url, options)),
  getList: <T>(url: string, options?: RequestOptions) => unwrap(lenderApi.get<ListResponse<T>>(url, options)),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) => unwrap(lenderApi.post<T>(url, data, options)),
  put: <T>(url: string, data?: unknown, options?: RequestOptions) => unwrap(lenderApi.put<T>(url, data, options)),
  patch: <T>(url: string, data?: unknown, options?: RequestOptions) => unwrap(lenderApi.patch<T>(url, data, options)),
  delete: <T>(url: string, options?: RequestOptions) => unwrap(lenderApi.delete<T>(url, options))
};

export const notifyRouteChange = () => undefined;

export default apiClient;
