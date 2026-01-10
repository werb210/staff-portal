import { apiClient } from "./client";
import type { AuthenticatedUser } from "@/services/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};

export const login = (payload: LoginPayload) =>
  apiClient.post<LoginResponse>("/auth/login", payload, { skipAuth: true });

export const fetchCurrentUser = () => apiClient.get<AuthenticatedUser>("/auth/me");

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthenticatedUser;
};

export const refresh = (refreshToken: string) =>
  apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken }, { skipAuth: true });

export const logout = () => apiClient.post<void>("/auth/logout");
