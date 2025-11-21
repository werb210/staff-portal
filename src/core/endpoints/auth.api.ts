import apiClient from "../api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse<TUser = unknown> {
  token: string;
  user: TUser;
}

export const login = <TUser = unknown>(payload: LoginPayload) =>
  apiClient.post<LoginResponse<TUser>>("/api/users/login", payload);

export const fetchCurrentUser = <TUser = unknown>() => apiClient.get<TUser>("/api/users/me");
