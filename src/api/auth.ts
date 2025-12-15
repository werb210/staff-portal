import { apiClient } from "./client";
import type { UserProfile } from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: UserProfile;
};

export const login = (payload: LoginPayload) =>
  apiClient.post<LoginResponse>("/api/auth/login", payload, { skipAuth: true });

export const fetchCurrentUser = () => apiClient.get<UserProfile>("/api/auth/me");
