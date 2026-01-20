import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext } from "@/auth/AuthContext";
import type { AuthenticatedUser, OtpStartResponse } from "@/services/auth";

export type StaffUser = AuthenticatedUser & {
  role?: string;
  name?: string;
  requiresOtp?: boolean;
};

export type AuthValue = {
  user: StaffUser | null;
  tokens: { token: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: string;
  error: string | null;
  startOtp: (payload: { phone: string }) => Promise<OtpStartResponse>;
  verifyOtp: (payload: { code: string; phone?: string }) => Promise<void>;
  setAuth: (payload: { token: string; user: StaffUser | null }) => void;
  setAuthenticated: () => void;
  refreshUser: (accessToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuth = (): AuthValue => {
  const {
    user,
    token,
    authenticated,
    authReady,
    status,
    error,
    startOtp,
    verifyOtp,
    setAuth,
    setAuthenticated,
    refreshUser,
    logout
  } = useAuthContext();

  const handleStartOtp: AuthValue["startOtp"] = useCallback(
    async (payload) => startOtp(payload),
    [startOtp]
  );

  const handleVerifyOtp: AuthValue["verifyOtp"] = useCallback(
    async (payload) => {
      await verifyOtp(payload);
    },
    [verifyOtp]
  );

  return useMemo(
    () => ({
      user: user as StaffUser | null,
      tokens: token ? { token } : null,
      isAuthenticated: authenticated,
      isLoading: !authReady,
      status,
      error,
      startOtp: handleStartOtp,
      verifyOtp: handleVerifyOtp,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    }),
    [
      user,
      token,
      authenticated,
      authReady,
      status,
      error,
      handleStartOtp,
      handleVerifyOtp,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    ]
  );
};
