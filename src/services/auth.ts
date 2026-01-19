import api from "@/api/client";

type VerifyOtpResponse = {
  accessToken: string;
};

export async function startOtp(payload: { phone: string }) {
  await api.post("/auth/otp/start", payload);
}

export async function verifyOtp(payload: { phone: string; code: string }) {
  const { data } = await api.post<VerifyOtpResponse>("/auth/otp/verify", payload);
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
