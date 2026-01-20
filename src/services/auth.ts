import api from "@/api/client";

export type AuthenticatedUser = Record<string, any>;

export type OtpStartResponse =
  | {
      sessionId?: string;
      requestId?: string;
    }
  | null;

export async function startOtp(payload: { phone: string }): Promise<OtpStartResponse> {
  const response = await api.post<OtpStartResponse>("/auth/otp/start", payload);
  return response.data ?? null;
}

export type OtpVerifyResponse =
  | {
      token: string;
      user?: AuthenticatedUser | null;
      refreshToken?: string;
      refresh_token?: string;
    }
  | null;

export async function verifyOtp(payload: { phone: string; code: string }): Promise<OtpVerifyResponse> {
  const response = await api.post<OtpVerifyResponse>("/api/auth/otp/verify", payload);
  return response.data ?? null;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
