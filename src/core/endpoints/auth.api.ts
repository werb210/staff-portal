import apiClient from "@/api/client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse<TUser = unknown> {
  token: string;
  user: TUser;
}

export const login = <TUser = unknown>(payload: LoginPayload) =>
  apiClient.post<LoginResponse<TUser>>("/api/auth/login", payload);

export const fetchCurrentUser = <TUser = unknown>() => apiClient.get<TUser>("/api/auth/me");
