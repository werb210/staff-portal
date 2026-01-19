import axios, { AxiosError } from "axios";
import { getStoredAccessToken, clearStoredAuth } from "@/services/token";

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

export const notifyRouteChange = () => undefined;

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const baseURL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    const status = err.response?.status;

    // Only clear auth if token is missing or malformed
    if (status === 401) {
      const token = getStoredAccessToken();
      if (!token) {
        clearStoredAuth();
      }
    }

    return Promise.reject(err);
  }
);

export const lenderApiClient = axios.create({
  baseURL,
  withCredentials: true,
});

lenderApiClient.interceptors.request.use(config => {
  if (config.skipAuth) {
    return config;
  }
  const tokens = lenderApiConfig.tokenProvider?.() ?? null;
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

lenderApiClient.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    if (status === 401) {
      lenderApiConfig.onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);

export default api;
export const apiClient = api;
export const otpRequestOptions = { skipAuth: true };
export const otpStartRequestOptions = { skipAuth: true };
