import { apiClient } from "@/api/apiClient";
import type { AuthRequestConfig } from "@/lib/api";
import { ApiError } from "@/lib/api";

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
  const response = await apiClient.post<OtpStartResponse>("/auth/otp/start", payload, {
    skipAuth: true,
    skipRequestId: true
  } as AuthRequestConfig);

  if (!response.success) {
    throw new ApiError({
      status: response.error.status ?? 500,
      message: response.error.message,
      code: response.error.code,
      requestId: response.error.requestId,
      details: response.error.details
    });
  }

  return {
    data: response.data ?? null,
    headers: {}
  };
}

export async function verifyOtp(payload: { phone: string; code: string }): Promise<OtpVerifyResponse> {
  const response = await apiClient.post<OtpVerifyResponse>("/auth/otp/verify", payload, {
    skipAuth: true,
    skipRequestId: true
  } as AuthRequestConfig);

  if (!response.success) {
    throw new ApiError({
      status: response.error.status ?? 500,
      message: response.error.message,
      code: response.error.code,
      requestId: response.error.requestId,
      details: response.error.details
    });
  }

  return response.data;
}

export async function logout(): Promise<void> {
  const response = await apiClient.post("/auth/logout");
  if (!response.success) {
    throw new ApiError({
      status: response.error.status ?? 500,
      message: response.error.message,
      code: response.error.code,
      requestId: response.error.requestId,
      details: response.error.details
    });
  }
}
