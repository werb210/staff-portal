import { apiClient } from "./client";
import type { AuthenticatedUser } from "@/services/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthenticatedUser;
};

export const login = (payload: LoginPayload) =>
  apiClient.post<LoginResponse>("/auth/login", payload, { skipAuth: true });

export const fetchCurrentUser = () => apiClient.get<AuthenticatedUser>("/auth/me");
