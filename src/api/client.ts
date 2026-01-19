import axios, { AxiosError } from "axios";
import { getStoredAccessToken, clearStoredAuth } from "@/services/token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    const status = err.response?.status;

    // Only clear auth if token is missing or malformed
    if (status === 401) {
      const token = getStoredAccessToken();
      if (!token) {
        clearStoredAuth();
      }
    }

    return Promise.reject(err);
  }
);

export default api;
export const apiClient = api;
