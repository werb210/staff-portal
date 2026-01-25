import axios from "axios";
import api from "@/lib/api";

export const clientApi = axios.create({
  baseURL: "https://api.staff.boreal.financial",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

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
  api.post<OtpStartResponse>("/auth/otp/start", payload);

export const otpVerify = (payload: OtpVerifyPayload) =>
  api.post<OtpVerifyResponse>("/auth/otp/verify", payload);

export const otp = {
  start: otpStart,
  verify: otpVerify
};

export default api;
