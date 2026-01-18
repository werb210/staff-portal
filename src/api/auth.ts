import { apiClient, otpRequestOptions, otpStartRequestOptions } from "./client";
import type { AuthenticatedUser, OtpVerifyResponse as OtpVerifyResponseType } from "@/services/auth";

export type OtpStartPayload = {
  phone: string;
};

export type OtpStartResponse = {
  sessionId?: string;
};

export const startOtp = (payload: OtpStartPayload) =>
  apiClient.post<OtpStartResponse>("/auth/otp/start", payload, otpStartRequestOptions);

export type OtpVerifyPayload = {
  phone: string;
  code: string;
};

export type OtpVerifyResponse = OtpVerifyResponseType;

export const verifyOtp = (payload: OtpVerifyPayload) =>
  apiClient.post<OtpVerifyResponse>("/auth/otp/verify", payload, otpRequestOptions);

export const fetchCurrentUser = () =>
  apiClient.get<AuthenticatedUser>("/auth/me", { skipAuthRefresh: true });

export const logout = () => apiClient.post<void>("/auth/logout");
