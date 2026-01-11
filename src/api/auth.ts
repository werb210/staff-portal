import { apiClient } from "./client";
import type { AuthenticatedUser, LoginSuccess } from "@/services/auth";

export type OtpStartPayload = {
  phone: string;
};

export type OtpStartResponse = {
  sessionId?: string;
};

export const startOtp = (payload: OtpStartPayload) =>
  apiClient.post<OtpStartResponse>("/auth/otp/start", payload, {
    skipAuth: true,
    authMode: "none",
    retryOnConflict: false,
    withCredentials: false,
    skipIdempotencyKey: true
  });

export type OtpVerifyPayload = {
  phone: string;
  code: string;
  sessionId?: string;
};

export type OtpVerifyResponse = LoginSuccess;

export const verifyOtp = (payload: OtpVerifyPayload) =>
  apiClient.post<OtpVerifyResponse>("/auth/otp/verify", payload, {
    skipAuth: true,
    authMode: "none",
    retryOnConflict: false,
    withCredentials: false,
    skipIdempotencyKey: true
  });

export const fetchCurrentUser = () => apiClient.get<AuthenticatedUser>("/auth/me");

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthenticatedUser;
};

export const refresh = (refreshToken: string) =>
  apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken }, { skipAuth: true });

export const logout = () => apiClient.post<void>("/auth/logout");
