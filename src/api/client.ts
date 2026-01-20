import axios, { type AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
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

export type OtpVerifyResponse = null | Record<string, unknown>;

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
const apiBaseURL = rawBaseURL?.endsWith("/api") ? rawBaseURL : `${rawBaseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true
});

api.interceptors.request.use((config: AxiosRequestConfig) => attachRequestIdAndLog(config));

api.interceptors.response.use(
  (res: AxiosResponse) => logResponse(res),
  (err) => {
    logError(err as AxiosError);
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
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
