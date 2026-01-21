import api, { type AuthRequestConfig } from "@/lib/api";

export type OtpStartPayload = {
  phone: string;
};

export type OtpStartResponse =
  | {
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

export const otpStart = (payload: OtpStartPayload) =>
  api.post<OtpStartResponse>("/auth/otp/start", payload, { skipAuth: true } as AuthRequestConfig);

export const otpVerify = (payload: OtpVerifyPayload) =>
  api.post<OtpVerifyResponse>("/auth/otp/verify", payload, { skipAuth: true } as AuthRequestConfig);

export const otp = {
  start: otpStart,
  verify: otpVerify
};

export default api;
