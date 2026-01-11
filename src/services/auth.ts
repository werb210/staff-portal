import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { apiClient, ApiError } from "@/api/client";
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

const normalizePhoneNumber = (phoneNumber: string) => {
  const parsed = parsePhoneNumberFromString(phoneNumber);
  if (!parsed || !parsed.isValid()) {
    throw new Error("Invalid phone format.");
  }
  return parsed.format("E.164");
};

export async function startOtp(phoneNumber: string): Promise<OtpStartResponse> {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  let attempt = 0;

  while (attempt < 2) {
    try {
      return await apiClient.post<OtpStartResponse>(
        "/auth/otp/start",
        { phoneNumber: normalizedPhoneNumber },
        { skipAuth: true }
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && attempt === 0) {
        attempt += 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error("OTP start failed after retry");
}

export async function verifyOtp(phoneNumber: string, code: string, sessionId?: string): Promise<LoginSuccess> {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const data = await apiClient.post<LoginSuccess>(
    "/auth/otp/verify",
    { phoneNumber: normalizedPhoneNumber, code, sessionId },
    { skipAuth: true }
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
