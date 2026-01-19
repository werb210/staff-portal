import api from "@/api/client";

export async function startOtp(input: { phone: string }) {
  await api.post("/auth/otp/start", input);
}

export async function verifyOtp(input: { phone: string; code: string }) {
  await api.post("/auth/otp/verify", input);
}
