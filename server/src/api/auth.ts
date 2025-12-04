import { api } from "@/lib/http";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export async function login(payload: LoginPayload) {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
}

export async function fetchMe() {
  const res = await api.get<LoginResponse>("/auth/me");
  return res.data;
}

export async function logout() {
  await api.post("/auth/logout");
}
