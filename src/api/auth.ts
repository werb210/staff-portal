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
  apiClient.post<LoginResponse>("/auth/login", payload, { skipAuth: true });

export const fetchCurrentUser = () => apiClient.get<UserProfile>("/auth/me");
