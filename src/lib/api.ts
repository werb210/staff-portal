import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { getToken, clearToken } from "./auth";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------
// REQUEST: Attach token
// ---------------------------
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// ---------------------------
// RESPONSE: Handle errors
// ---------------------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

// ---------------------------
// Typed helpers
// ---------------------------
export async function apiGet<T>(url: string): Promise<T> {
  const res = await api.get(url);
  return res.data;
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await api.post(url, body);
  return res.data;
}

export async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await api.put(url, body);
  return res.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await api.delete(url);
  return res.data;
}
