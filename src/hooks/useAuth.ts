import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext, type AuthState } from "@/auth/AuthContext";
import type { AuthenticatedUser } from "@/services/auth";

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
    const res = await fetch("/api/auth/me", { credentials: "include" });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const ct = res.headers.get("content-type");
    if (!ct || !ct.includes("application/json")) {
      clearAuth();
      return false;
    }

    const data = (await res.json()) as AuthenticatedUser;
    setUser(data);
    setAuthState("authenticated");
    return true;
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
