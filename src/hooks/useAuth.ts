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
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { code: string; phone?: string }) => Promise<LoginSuccess>;
  logout: () => void;
};

export const useAuth = (): AuthValue => {
  const { user, token, status, authReady, startOtp, verifyOtp, logout } = useAuthContext();

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
      isAuthenticated: status === "authenticated",
      isLoading: !authReady,
      startOtp: handleStartOtp,
      verifyOtp: handleVerifyOtp,
      logout,
    }),
    [user, token, status, authReady, handleStartOtp, handleVerifyOtp, logout]
  );
};
