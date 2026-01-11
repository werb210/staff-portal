import { apiClient } from "@/api/client";
import type { UserRole } from "@/utils/roles";
import { getStoredRefreshToken } from "@/services/token";

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

export async function startOtp(phoneNumber: string): Promise<OtpStartResponse> {
  return apiClient.post<OtpStartResponse>(
    "/auth/otp/start",
    { phone: phoneNumber },
    {
      skipAuth: true,
      authMode: "none",
      retryOnConflict: false,
      withCredentials: false,
      skipIdempotencyKey: true
    }
  );
}

export async function verifyOtp(phoneNumber: string, code: string, sessionId?: string): Promise<LoginSuccess> {
  const data = await apiClient.post<LoginSuccess>(
    "/auth/otp/verify",
    { phone: phoneNumber, code, sessionId },
    {
      skipAuth: true,
      authMode: "none",
      retryOnConflict: false,
      withCredentials: false,
      skipIdempotencyKey: true
    }
  );

  if (!data?.accessToken) {
    throw new Error("OTP verification response missing access token");
  }

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
