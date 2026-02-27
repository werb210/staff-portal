import axios from "axios";
import { ENV } from "@/config/env";
import { getStoredAccessToken } from "@/services/token";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true
});


api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === "test") {
    config.baseURL = "http://localhost";
  }

  if (typeof config.url === "string" && config.url.startsWith("/") && !config.url.startsWith("/api/")) {
    config.url = `/api${config.url}`;
  }

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || getStoredAccessToken();

  if (token) {
    config.headers = {
      ...(config.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    } as any;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject({
        status: 0,
        message: error?.message ?? "Network error"
      });
    }

    console.error("API error:", error.response.status);
    return Promise.reject({
      status: error.response.status,
      message: (error.response.data as { message?: string } | undefined)?.message ?? error.message ?? "Request failed",
      data: error.response.data
    });
  }
);

export const clientApi = api;
export const otpStart = (payload: { phone: string }) => api.post("/auth/otp/start", payload);
export const otpVerify = (payload: { phone: string; code: string }) => api.post("/auth/otp/verify", payload);

export default api;
