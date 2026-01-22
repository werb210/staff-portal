import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext, type AuthState } from "@/auth/AuthContext";
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
  authState: AuthState;
  authStatus: AuthState;
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
    authState,
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
      const response = await api.get<AuthenticatedUser>("/auth/me");
      setUser(response.data ?? null);
      setAuthState("authenticated");
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth, setAuthState, setUser]);

  const isLoading =
    authState === "authenticated_pending" ||
    (authState === "authenticated" && rolesStatus === "loading");
  const isAuthenticated = authState === "authenticated";

  return useMemo(
    () => ({
      user: user as StaffUser | null,
      accessToken,
      isAuthenticated,
      isLoading,
      authState,
      authStatus: authState,
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
      authState,
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
