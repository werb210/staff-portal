import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

declare global {
  interface Window {
    __ENV__?: Record<string, any>;
  }
}

/**
 * API base origin (NO /api here)
 * - GitHub Actions "inject API base" step may write window.__ENV__.API_ORIGIN
 * - fallback to Vite env
 */
const API_ORIGIN =
  window.__ENV__?.API_ORIGIN ||
  (import.meta as any).env?.VITE_API_ORIGIN ||
  "https://server.boreal.financial";

function getStoredToken(): string | null {
  // support common keys used across iterations
  const t =
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");
  return t && t.trim() ? t.trim() : null;
}

/**
 * Normalize request URL so callers can pass:
 * - "/api/..." (already correct)
 * - "/applications" or "applications" (we prefix /api)
 * - full absolute URL (we leave untouched)
 */
function normalizePath(input?: string): string {
  const url = (input || "").trim();

  if (!url) return "/api";

  // Absolute URL: leave untouched
  if (/^https?:\/\//i.test(url)) return url;

  // Ensure leading slash
  const withSlash = url.startsWith("/") ? url : `/${url}`;

  // If it already starts with /api, keep it
  if (withSlash === "/api" || withSlash.startsWith("/api/")) return withSlash;

  // Otherwise prefix /api
  return `/api${withSlash}`;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // normalize url path
  config.url = normalizePath(config.url);

  // attach bearer token if present
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // bubble up error normally; auth layer can redirect on 401
    return Promise.reject(err);
  }
);

/** Convenience wrappers (optional use) */
export async function apiGet<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function apiDelete<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
