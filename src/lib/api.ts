import axios from "axios";
import { getToken, clearAuth } from "./storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://boreal-staff-server.azurewebsites.net",
  timeout: 20000,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
export { api };

export async function apiGet<T = unknown>(path: string) {
  const res = await api.get<T>(path);
  return res.data;
}

export async function apiPost<T = unknown>(path: string, body: any) {
  const res = await api.post<T>(path, body);
  return res.data;
}

export async function apiPut<T = unknown>(path: string, body: any) {
  const res = await api.put<T>(path, body);
  return res.data;
}

export async function apiDelete<T = unknown>(path: string) {
  const res = await api.delete<T>(path);
  return res.data;
}
