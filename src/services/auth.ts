import api from "@/api/client";

export async function startOtp(payload: { phone: string }) {
  await api.post("/auth/otp/start", payload);
}

export async function verifyOtp(payload: { phone: string; code: string }) {
  await api.post("/auth/otp/verify", payload);
}

export async function logout() {
  await api.post("/auth/logout");
}
