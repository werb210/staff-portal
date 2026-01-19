import axios, { AxiosRequestConfig } from "axios";
import { getStoredAccessToken } from "@/services/token";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
if (!rawBaseURL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const apiBaseURL = rawBaseURL.endsWith("/api")
  ? rawBaseURL
  : `${rawBaseURL}/api`;

export const api = axios.create({
  baseURL: apiBaseURL,
});

export const otp = axios.create({
  baseURL: rawBaseURL,
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});
