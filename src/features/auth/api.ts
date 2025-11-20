import api from "../../lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post("/api/auth/login", payload);
  return res.data;
}
