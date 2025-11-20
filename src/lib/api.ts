import { api } from "./axios";

export async function get<T>(url: string, params?: Record<string, unknown>) {
  const response = await api.get<T>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: unknown) {
  const response = await api.post<T>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown) {
  const response = await api.put<T>(url, data);
  return response.data;
}

export async function del<T>(url: string) {
  const response = await api.delete<T>(url);
  return response.data;
}
