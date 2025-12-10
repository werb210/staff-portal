import { apiClient } from "./client";
import type { AuthTokens, UserProfile } from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
};

export const login = (payload: LoginPayload) =>
  apiClient.post<LoginResponse>("/auth/login", payload, { skipAuth: true });

export const fetchCurrentUser = () => apiClient.get<UserProfile>("/auth/me");

export const refreshSession = (refreshToken: string) =>
  apiClient.post<AuthTokens>("/auth/refresh", { refreshToken }, { skipAuth: true });
