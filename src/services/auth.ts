import api from "@/lib/api";

export type LoginPayload = {
  email: string;
  password: string;
};

async function login(payload: LoginPayload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data as { token: string; role: string; email: string; user: Record<string, unknown> };
}

async function me() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export const AuthAPI = {
  login,
  me,
};
