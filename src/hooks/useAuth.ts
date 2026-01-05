import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext } from "@/auth/AuthContext";
import type { AuthenticatedUser, LoginSuccess } from "@/services/auth";
import type { UserRole } from "@/utils/roles";

export type StaffUser = AuthenticatedUser & {
  role?: UserRole;
  name?: string;
  requiresOtp?: boolean;
};

type AuthTokens = {
  token?: string;
};

export type AuthValue = {
  user: StaffUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginSuccess>;
  logout: () => void;
};

export const useAuth = (): AuthValue => {
  const { user, token, status, login, logout } = useAuthContext();

  const handleLogin: AuthValue["login"] = useCallback(
    async (email, password) => {
      return login(email, password);
    },
    [login]
  );

  return useMemo(
    () => ({
      user,
      tokens: token ? { token } : null,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      login: handleLogin,
      logout,
    }),
    [user, token, status, handleLogin, logout]
  );
};
