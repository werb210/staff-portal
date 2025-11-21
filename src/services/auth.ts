import http from "@/lib/http";

export type LoginPayload = {
  email: string;
  password: string;
};

async function login(payload: LoginPayload) {
  const response = await http.post("/api/users/login", payload);
  return response.data as { token: string; role: string; email: string; user: Record<string, unknown> };
}

async function me() {
  const response = await http.get("/api/users/me");
  return response.data;
}

export const AuthAPI = {
  login,
  me,
};
