// legacy – not consumed by active auth system
import http from "@/lib/http";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  role?: string;
  email?: string;
  user?: Record<string, unknown>;
};

async function login(payload: LoginPayload): Promise<LoginResponse> {
  // deprecated – not used
  const response = await http.post("/api/auth/login", payload);
  return response.data as LoginResponse;
}

async function me() {
  // deprecated – not used
  const response = await http.get("/api/auth/me");
  return response.data;
}

export const AuthAPI = {
  login,
  me,
};
