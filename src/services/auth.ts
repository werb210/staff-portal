import api from "@/api/client";
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

export type OtpVerifyResponse = {
  token?: string;
  user?: AuthenticatedUser;
} | null;

export type OtpStartResponse = void;

type OtpVerifyApiResponse = {
  accessToken?: string;
  token?: string;
  user: AuthenticatedUser;
};

export async function startOtp(phone: string): Promise<void> {
  const normalizedPhone = normalizeToE164(phone);
  await api.post("/auth/otp/start", { phone: normalizedPhone });
}

export async function verifyOtp(phone: string, code: string): Promise<OtpVerifyResponse> {
  const normalizedPhone = normalizeToE164(phone);
  const res = await api.post<OtpVerifyApiResponse | undefined>("/auth/otp/verify", { phone: normalizedPhone, code });
  if (res.status === 204 || !res.data) {
    return null;
  }
  const accessToken = res.data.accessToken ?? res.data.token;
  if (!accessToken) {
    return null;
  }
  return {
    token: accessToken,
    user: res.data.user
  };
}

export const logout = () => api.post<void>("/auth/logout");
