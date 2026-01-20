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
  isAuthenticated: boolean;
  isLoading: boolean;
  status: string;
  error: string | null;
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { code: string; phone?: string } | string, code?: string) => Promise<void>;
  setAuth: (payload: { user: StaffUser | null }) => void;
  setAuthenticated: () => void;
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuth = (): AuthValue => {
  const {
    user,
    status,
    error,
    startOtp,
    verifyOtp,
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
      isAuthenticated,
      isLoading,
      status,
      error,
      startOtp,
      verifyOtp,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      status,
      error,
      startOtp,
      verifyOtp,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    ]
  );
};
