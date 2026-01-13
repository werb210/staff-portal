import { apiClient, otpRequestOptions, otpStartRequestOptions } from "@/api/client";
import type { UserRole } from "@/utils/roles";
import { getStoredRefreshToken } from "@/services/token";
import { normalizeToE164 } from "@/utils/phone";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};

export type LoginSuccess = {
  accessToken: string;
  refreshToken?: string;
  user: AuthenticatedUser;
};

export type OtpStartResponse = {
  sessionId?: string;
};

export async function startOtp(payload: { phone: string }): Promise<OtpStartResponse> {
  const normalizedPhone = normalizeToE164(payload.phone);
  return apiClient.post<OtpStartResponse>(
    "/api/auth/otp/start",
    { ...payload, phone: normalizedPhone },
    otpStartRequestOptions
  );
}

export async function verifyOtp(payload: { phone: string; code: string }): Promise<LoginSuccess> {
  const normalizedPhone = normalizeToE164(payload.phone);
  const data = await apiClient.post<LoginSuccess>(
    "/api/auth/otp/verify",
    { ...payload, phone: normalizedPhone },
    otpRequestOptions
  );

  return data;
}

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthenticatedUser;
};

export const refresh = () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
  return apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken }, { skipAuth: true });
};

export const logout = () => apiClient.post<void>("/auth/logout");
