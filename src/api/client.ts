import axios, { type AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { redirectToLogin } from "@/services/api";
import { attachRequestIdAndLog, logError, logResponse } from "@/utils/apiLogging";
import { getAccessToken } from "@/auth/auth.store";
import { reportAuthFailure } from "@/auth/authEvents";

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

export type OtpVerifyResponse = {
  accessToken: string;
  refreshToken: string;
};

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
const apiBaseURL = rawBaseURL?.endsWith("/api") ? rawBaseURL : `${rawBaseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`
    };
  }
  return attachRequestIdAndLog(config);
});

api.interceptors.response.use(
  (res: AxiosResponse) => logResponse(res),
  (err) => {
    logError(err as AxiosError);
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      reportAuthFailure(status === 401 ? "unauthorized" : "forbidden");
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
