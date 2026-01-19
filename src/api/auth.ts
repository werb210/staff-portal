import { apiClient, otpClient, otpStartRequestOptions, otpVerifyRequestOptions } from "./client";
import type { AuthenticatedUser, OtpVerifyResponse as OtpVerifyResponseType } from "@/services/auth";

export type OtpStartPayload = {
  phone: string;
};

export type OtpStartResponse = {
  sessionId?: string;
};

export const startOtp = (payload: OtpStartPayload) =>
  otpClient.post<OtpStartResponse>("/auth/otp/start", payload, otpStartRequestOptions);

export type OtpVerifyPayload = {
  phone: string;
  code: string;
};

export type OtpVerifyResponse = OtpVerifyResponseType;

export const verifyOtp = (payload: OtpVerifyPayload) =>
  otpClient.post<OtpVerifyResponse>("/auth/otp/verify", payload, otpVerifyRequestOptions);

export const fetchCurrentUser = () =>
  apiClient.get<AuthenticatedUser>("/auth/me", { skipAuthRefresh: true });

export const logout = () => apiClient.post<void>("/auth/logout");
