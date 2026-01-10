import { apiClient, ApiError } from "@/api/client";
import type { UserRole } from "@/utils/roles";
import { getStoredRefreshToken } from "@/services/token";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};

export type LoginSuccess = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};

export async function login(email: string, password: string): Promise<LoginSuccess> {
  let attempt = 0;

  while (attempt < 2) {
    try {
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

      if (!data?.refreshToken) {
        throw new Error("Login response missing refresh token");
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && attempt === 0) {
        attempt += 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Login failed after retry");
}

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthenticatedUser;
};

export const refresh = () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
  return apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken }, { skipAuth: true });
};

export const logout = () => apiClient.post<void>("/auth/logout");
