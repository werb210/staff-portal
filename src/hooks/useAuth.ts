import { useMemo } from "react";
import { useAuth as useAuthContext } from "@/auth/AuthContext";
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
  status: string;
  error: string | null;
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { code: string; phone?: string } | string, code?: string) => Promise<void>;
  login: (token: string) => Promise<void>;
  setAuth: (payload: { user: StaffUser | null }) => void;
  setAuthenticated: () => void;
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuth = (): AuthValue => {
  const {
    user,
    status,
    accessToken,
    error,
    startOtp,
    verifyOtp,
    login,
    setAuth,
    setAuthenticated,
    refreshUser,
    logout
  } = useAuthContext();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return useMemo(
    () => ({
      user: user as StaffUser | null,
      accessToken,
      isAuthenticated,
      isLoading,
      status,
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
      status,
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
