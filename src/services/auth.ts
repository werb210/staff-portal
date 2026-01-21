import api from "@/api/client";

export type AuthenticatedUser = Record<string, any>;

export type OtpStartResponse =
  | {
      requestId?: string;
      twilioSid?: string;
      sid?: string;
    }
  | null;

export type OtpStartResult = {
  data: OtpStartResponse;
  headers: Record<string, string>;
};

export type OtpVerifyResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function startOtp(payload: { phone: string }): Promise<OtpStartResult | null> {
  const response = await api.post<OtpStartResponse>("/auth/otp/start", payload);
  if (response.status === 204) {
    return null;
  }
  return {
    data: response.data ?? null,
    headers: response.headers ?? {}
  };
}

export async function verifyOtp(payload: { phone: string; code: string }): Promise<OtpVerifyResponse> {
  const response = await api.post<OtpVerifyResponse>("/auth/otp/verify", payload);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
