import axios, { type AxiosRequestConfig } from "axios";
import { getStoredAccessToken } from "@/services/token";

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

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL
  ?? (import.meta.env.MODE === "test" ? "http://localhost" : undefined);

if (!rawBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const apiBaseURL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

const otpBaseURL = rawBaseUrl;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export const otpClient = axios.create({
  baseURL: otpBaseURL,
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


export const lenderApiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

lenderApiClient.interceptors.request.use(config => {
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

export default api;
export const apiClient = api;
export const otpStartRequestOptions: AxiosRequestConfig = { ...otpClient.defaults };
export const otpVerifyRequestOptions: AxiosRequestConfig = { ...otpClient.defaults };
