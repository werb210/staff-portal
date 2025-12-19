import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext } from "@/auth/AuthContext";

export type StaffUser = {
  id?: string;
  email?: string;
  role?: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuth = (): AuthValue => {
  const { user, loading, login, logout } = useAuthContext();

  const handleLogin: AuthValue["login"] = useCallback(
    async (email, password) => {
      await login(email, password);
    },
    [login]
  );

  return useMemo(
    () => ({
      user,
      tokens: null,
      isAuthenticated: !!user,
      isLoading: loading,
      login: handleLogin,
      logout,
    }),
    [user, loading, handleLogin, logout]
  );
};
