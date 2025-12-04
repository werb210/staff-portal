// server/src/api/auth.ts
import { http } from "@/lib/http";
import type { User } from "@/types/User";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", req);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await http.get<User>("/auth/me");
  return data;
}
