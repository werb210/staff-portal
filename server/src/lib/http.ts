// server/src/lib/http.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL =
  (import.meta as any).env?.VITE_STAFF_API_BASE_URL ||
  process.env.VITE_STAFF_API_BASE_URL ||
  "/api";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (authToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Optional: emit a global 401 event, clear auth store, etc.
        // For now we just rethrow.
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const http = createHttpClient();

export type HttpError = AxiosError;
