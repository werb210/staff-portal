import axios, { type AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getStoredAccessToken, clearStoredAuth } from "@/services/token";
import { redirectToLogin } from "@/services/api";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";

export type OtpStartPayload = {
  phone: string;
};

export type OtpStartResponse =
  | {
      sessionId?: string;
      requestId?: string;
      twilioSid?: string;
      sid?: string;
    }
  | null;

export type OtpVerifyPayload = {
  phone: string;
  code: string;
};

export type OtpVerifyResponse =
  | {
      token: string;
      user?: Record<string, unknown> | null;
      refreshToken?: string;
      refresh_token?: string;
    }
  | null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getStoredAccessToken();
  const skipAuth = (config as any)?.skipAuth;
  if (token && !skipAuth) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return attachRequestIdAndLog(config);
});

api.interceptors.response.use(
  (res: AxiosResponse) => logResponse(res),
  (err) => {
    logError(err as AxiosError);
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      clearStoredAuth();
      if (typeof window !== "undefined") {
        const isOnLogin = window.location.pathname.startsWith("/login");
        if (!isOnLogin) {
          redirectToLogin();
        }
      }
    }
    return Promise.reject(err);
  }
);

export const otpStart = (payload: OtpStartPayload) =>
  api.post<OtpStartResponse>("/auth/otp/start", payload);

export const otpVerify = (payload: OtpVerifyPayload) =>
  api.post<OtpVerifyResponse>("/auth/otp/verify", payload);

export const otp = {
  start: otpStart,
  verify: otpVerify
};

export default api;
