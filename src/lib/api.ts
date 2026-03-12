import { apiClient } from "@/lib/apiClient";

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET") as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  const response = await apiClient.request<T>({
    url: normalizePath(path),
    method,
    data: options.body,
    headers: options.headers as Record<string, string> | undefined
  });

  return response.data;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, options);
}

export const api = {
  request
};

export default api;
