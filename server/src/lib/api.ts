// server/src/lib/api.ts
import { http } from "@/lib/http";

export function get<T = unknown>(url: string, params?: Record<string, unknown>) {
  return http.get<T>(url, { params }).then((r) => r.data);
}

export function post<T = unknown, B = unknown>(url: string, body?: B) {
  return http.post<T>(url, body).then((r) => r.data);
}

export function put<T = unknown, B = unknown>(url: string, body?: B) {
  return http.put<T>(url, body).then((r) => r.data);
}

export function del<T = unknown>(url: string) {
  return http.delete<T>(url).then((r) => r.data);
}
