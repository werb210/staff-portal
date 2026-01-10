import { apiClient } from "./client";
import type { AuthenticatedUser } from "@/services/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

export const login = (payload: LoginPayload) =>
  apiClient.post<LoginResponse>("/auth/login", payload, { skipAuth: true });

export const fetchCurrentUser = () => apiClient.get<AuthenticatedUser>("/auth/me");

export type RefreshResponse = {
  accessToken: string;
  user?: AuthenticatedUser;
};

export const refresh = () => apiClient.post<RefreshResponse>("/auth/refresh", undefined, { skipAuth: true });

export const logout = () => apiClient.post<void>("/auth/logout");
