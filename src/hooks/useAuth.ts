import { useCallback, useMemo } from "react";
import { useAuth as useAuthContext } from "@/auth/AuthContext";
import type { AuthenticatedUser, OtpVerifyResponse } from "@/services/auth";
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
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { code: string; phone?: string }) => Promise<OtpVerifyResponse>;
  setAuth: (payload: { token: string; user?: StaffUser | null }) => void;
  refreshUser: (accessToken?: string) => Promise<boolean>;
  logout: () => void;
};

export const useAuth = (): AuthValue => {
  const { user, token, authenticated, authReady, startOtp, verifyOtp, setAuth, refreshUser, logout } = useAuthContext();

  const handleStartOtp: AuthValue["startOtp"] = useCallback(
    async (payload) => startOtp(payload),
    [startOtp]
  );

  const handleVerifyOtp: AuthValue["verifyOtp"] = useCallback(
    async (payload) => verifyOtp(payload),
    [verifyOtp]
  );

  return useMemo(
    () => ({
      user,
      tokens: token ? { token } : null,
      isAuthenticated: authenticated,
      isLoading: !authReady,
      startOtp: handleStartOtp,
      verifyOtp: handleVerifyOtp,
      setAuth,
      refreshUser,
      logout,
    }),
    [user, token, authenticated, authReady, handleStartOtp, handleVerifyOtp, setAuth, refreshUser, logout]
  );
};
