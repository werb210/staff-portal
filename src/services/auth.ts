import { apiClient } from "@/api/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginSuccess = {
  accessToken: string;
  user: AuthenticatedUser;
};

export async function login(email: string, password: string): Promise<LoginSuccess> {
  const { data } = await apiClient.post<LoginSuccess>(
    "/auth/login",
    { email, password },
    {
      skipAuth: true,
    }
  );

  return data;
}
