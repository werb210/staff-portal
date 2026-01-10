import { apiClient } from "@/api/client";
import type { UserRole } from "@/utils/roles";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};

export type LoginSuccess = {
  accessToken: string;
  user: AuthenticatedUser;
};

export async function login(email: string, password: string): Promise<LoginSuccess> {
  const data = await apiClient.post<LoginSuccess>(
    "/auth/login",
    { email, password },
    {
      skipAuth: true,
    }
  );

  if (!data?.accessToken) {
    throw new Error("Login response missing access token");
  }

  return data;
}

export type RefreshResponse = {
  accessToken: string;
  user?: AuthenticatedUser;
};

export const refresh = () => apiClient.post<RefreshResponse>("/auth/refresh", undefined, { skipAuth: true });

export const logout = () => apiClient.post<void>("/auth/logout");
