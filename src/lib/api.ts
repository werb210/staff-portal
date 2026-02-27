import axios, { AxiosError, AxiosInstance, type AxiosRequestConfig } from "axios";

function resolveBaseURL(): string {
  if (process.env.NODE_ENV === "test") {
    return "http://localhost/api";
  }

  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return "/api";
}

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

export type AuthRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipRequestId?: boolean;
};

export const api: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<T>(config);
    return response.data as T;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data;

    throw new ApiError({
      status,
      message: data?.message ?? axiosError.message,
      code: data?.code,
      requestId: (axiosError.response?.headers as Record<string, string> | undefined)?.["x-request-id"],
      details: data,
    });
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "test") {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
