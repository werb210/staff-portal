import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError, api } from "@/lib/api";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    message: string;
    status?: number;
    code?: string;
    requestId?: string;
    details?: unknown;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

const success = <T>(data: T): ApiSuccess<T> => ({ success: true, data });

const failure = (error: unknown): ApiFailure => {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.status,
        code: error.code,
        requestId: error.requestId,
        details: error.details
      }
    };
  }

  if (error instanceof Error) {
    return { success: false, error: { message: error.message } };
  }

  return { success: false, error: { message: "Unexpected API error" } };
};

const request = async <T>(runner: () => Promise<AxiosResponse<T>>): Promise<ApiResult<T>> => {
  try {
    const response = await runner();
    return success(response.data);
  } catch (error) {
    return failure(error);
  }
};

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>(() => api.get<T>(url, config)),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>(() => api.post<T>(url, data, config)),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>(() => api.put<T>(url, data, config)),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>(() => api.patch<T>(url, data, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>(() => api.delete<T>(url, config))
};
