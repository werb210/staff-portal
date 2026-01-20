import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";
import { getAccessToken } from "@/auth/auth.store";

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

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
if (!rawBaseURL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const apiBaseURL = rawBaseURL.endsWith("/api") ? rawBaseURL : `${rawBaseURL}/api`;

export const api = axios.create({
  baseURL: apiBaseURL
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const skipAuth = (config as { skipAuth?: boolean }).skipAuth;
  const token = getAccessToken();
  if (token && !skipAuth) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`
    };
  }
  return attachRequestIdAndLog(config);
});

api.interceptors.response.use(
  (response) => logResponse(response),
  (error: AxiosError) => {
    logError(error);
    const status = error.response?.status ?? 500;
    throw new ApiError({
      status,
      message: error.message,
      code: (error.response?.data as { code?: string })?.code,
      requestId: error.response?.headers?.["x-request-id"],
      details: error.response?.data
    });
  }
);
