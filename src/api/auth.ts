import { api, otp } from "./client";
import type { AuthenticatedUser, OtpVerifyResponse as OtpVerifyResponseType } from "@/services/auth";

export type OtpStartPayload = {
  phone: string;
};

export type OtpStartResponse = {
  sessionId?: string;
};

export const startOtp = (payload: OtpStartPayload) =>
  otp.post<OtpStartResponse>("/auth/otp/start", payload);

export type OtpVerifyPayload = {
  phone: string;
  code: string;
};

export type OtpVerifyResponse = OtpVerifyResponseType;

export const verifyOtp = (payload: OtpVerifyPayload) =>
  otp.post<OtpVerifyResponse>("/auth/otp/verify", payload);

export const fetchCurrentUser = () =>
  api.get<AuthenticatedUser>("/auth/me", { skipAuthRefresh: true });

export const logout = () => api.post<void>("/auth/logout");
