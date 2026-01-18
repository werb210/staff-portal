import { apiClient, otpRequestOptions, otpStartRequestOptions } from "@/api/client";
import type { UserRole } from "@/utils/roles";
import { normalizeToE164 } from "@/utils/phone";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};

export type LoginSuccess = {
  token: string;
  user: AuthenticatedUser;
};

export type OtpVerifyResponse = LoginSuccess;

export type OtpStartResponse = {
  sessionId?: string;
};

export async function startOtp(payload: { phone: string }): Promise<OtpStartResponse> {
  const normalizedPhone = normalizeToE164(payload.phone);
  return apiClient.post<OtpStartResponse>(
    "/auth/otp/start",
    { ...payload, phone: normalizedPhone },
    otpStartRequestOptions
  );
}

export async function verifyOtp(payload: { phone: string; code: string }): Promise<OtpVerifyResponse> {
  const normalizedPhone = normalizeToE164(payload.phone);
  return apiClient.post<OtpVerifyResponse>(
    "/auth/otp/verify",
    { ...payload, phone: normalizedPhone },
    otpRequestOptions
  );
}

export const logout = () => apiClient.post<void>("/auth/logout");
