import axios from "axios";
import { ENV } from "@/config/env";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

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
    } else {
      console.error("API error:", error.response.status);
    }
    return Promise.reject(error);
  }
);

export const clientApi = api;
export const otpStart = (payload: { phone: string }) => api.post("/auth/otp/start", payload);
export const otpVerify = (payload: { phone: string; code: string }) => api.post("/auth/otp/verify", payload);

export default api;
