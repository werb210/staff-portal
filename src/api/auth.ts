import api, { otpStart } from "./client";
import type { AuthenticatedUser } from "@/services/auth";

export { otpStart as startOtp } from "./client";

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code })
  });

  if (!res.ok) throw new Error("OTP verify failed");
  return res.json();
}

export const fetchCurrentUser = () => api.get<AuthenticatedUser>("/auth/me");

export const logout = () => api.post<void>("/auth/logout");
