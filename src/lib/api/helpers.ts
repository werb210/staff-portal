import api from "./client";

export async function get<T>(url: string, params?: any): Promise<T> {
  const res = await api.get(url, { params });
  return res.data;
}

export async function post<T>(url: string, body?: any): Promise<T> {
  const res = await api.post(url, body);
  return res.data;
}

export async function put<T>(url: string, body?: any): Promise<T> {
  const res = await api.put(url, body);
  return res.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await api.delete(url);
  return res.data;
}
