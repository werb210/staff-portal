import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext, type AuthStatus } from "@/auth/AuthContext";
import type { AuthenticatedUser } from "@/services/auth";
import api from "@/lib/api";
import { getAccessToken } from "@/lib/authToken";

export type StaffUser = AuthenticatedUser & {
  role?: string;
  name?: string;
  requiresOtp?: boolean;
};

export type AuthValue = {
  user: StaffUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authState: AuthStatus;
  authStatus: AuthStatus;
  rolesStatus: string;
  error: string | null;
  startOtp: (payload: { phone: string }) => Promise<boolean>;
  verifyOtp: (payload: { code: string; phone?: string } | string, code?: string) => Promise<boolean>;
  login: (token: string) => Promise<void>;
  setAuth: (payload: { user: StaffUser | null }) => void;
  setAuthenticated: () => void;
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuth = (): AuthValue => {
  const {
    user,
    authStatus,
    rolesStatus,
    accessToken,
    error,
    startOtp,
    verifyOtp,
    login,
    setAuth,
    setAuthenticated,
    setUser,
    setAuthState,
    clearAuth,
    logout
  } = useAuthContext();

  const refreshUser = useCallback(async (): Promise<boolean> => {
    try {
      if (!getAccessToken()) {
        clearAuth();
        return false;
      }
      setAuthState("loading");
      const response = await api.get<AuthenticatedUser>("/auth/me");
      setUser(response.data ?? null);
      setAuthState("authenticated");
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth, setAuthState, setUser]);

  const isLoading = authStatus === "loading" || rolesStatus === "loading";
  const isAuthenticated = authStatus === "authenticated";

  return useMemo(
    () => ({
      user: user as StaffUser | null,
      accessToken,
      isAuthenticated,
      isLoading,
      authState: authStatus,
      authStatus,
      rolesStatus,
      error,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    }),
    [
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      authStatus,
      rolesStatus,
      error,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    ]
  );
};
