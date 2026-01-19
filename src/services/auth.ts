import { apiClient, otpClient, otpStartRequestOptions, otpVerifyRequestOptions } from "@/api/client";
import type { UserRole } from "@/utils/roles";
import { normalizeToE164 } from "@/utils/phone";
import { setStoredAccessToken } from "@/services/token";

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

type OtpVerifyApiResponse = {
  accessToken?: string;
  token?: string;
  user: AuthenticatedUser;
};

export type OtpStartResponse = {
  sessionId?: string;
};

export async function startOtp(payload: { phone: string }): Promise<OtpStartResponse> {
  const normalizedPhone = normalizeToE164(payload.phone);
  return otpClient.post<OtpStartResponse>(
    "/auth/otp/start",
    { ...payload, phone: normalizedPhone },
    otpStartRequestOptions
  );
}

export async function verifyOtp(payload: { phone: string; code: string }): Promise<OtpVerifyResponse> {
  const normalizedPhone = normalizeToE164(payload.phone);
  const response = await otpClient.post<OtpVerifyApiResponse>(
    "/auth/otp/verify",
    { ...payload, phone: normalizedPhone },
    otpVerifyRequestOptions
  );
  const accessToken = response.accessToken ?? response.token;
  if (!accessToken) {
    throw new Error("Missing access token from OTP verification");
  }
  setStoredAccessToken(accessToken);
  return {
    token: accessToken,
    user: response.user
  };
}

export const logout = () => apiClient.post<void>("/auth/logout");
