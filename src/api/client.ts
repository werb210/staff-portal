import axios, { type AxiosRequestConfig } from "axios";
import { getStoredAccessToken } from "@/services/token";

const rawBase = import.meta.env.VITE_API_BASE_URL;
if (!rawBase) throw new Error("VITE_API_BASE_URL missing");

const apiBase = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
const otpBase = rawBase; // OTP is NOT /api-prefixed

export const api = axios.create({
  baseURL: apiBase,
});

export const otp = axios.create({
  baseURL: otpBase,
});

api.interceptors.request.use(cfg => {
  const token = getStoredAccessToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export type OtpStartOptions = AxiosRequestConfig;
export type OtpVerifyOptions = AxiosRequestConfig;
