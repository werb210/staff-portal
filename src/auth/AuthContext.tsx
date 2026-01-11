import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { logout as logoutService, startOtp as startOtpService, verifyOtp as verifyOtpService, type AuthenticatedUser, type LoginSuccess } from "@/services/auth";
import { fetchCurrentUser } from "@/api/auth";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredRefreshToken,
  setStoredUser
} from "@/services/token";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { redirectToLogin } from "@/services/api";
import { setApiStatus } from "@/state/apiStatus";

export type AuthStatus = "authenticated" | "unauthenticated" | "expired";

export type AuthContextType = {
  user: AuthenticatedUser | null;
  token: string | null;
  status: AuthStatus;
  authReady: boolean;
  pendingPhoneNumber: string | null;
  pendingSessionId: string | null;
  startOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (code: string, phoneNumber?: string) => Promise<LoginSuccess>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storedToken = getStoredAccessToken();
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser<AuthenticatedUser>());
  const [token, setToken] = useState<string | null>(() => storedToken);
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [authReady, setAuthReady] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const forceLogout = useCallback((nextStatus: AuthStatus) => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setStatus(nextStatus);
    setAuthReady(true);
    redirectToLogin();
  }, []);

  useEffect(() => {
    return registerAuthFailureHandler((reason) => {
      if (reason === "forbidden") {
        setApiStatus("forbidden");
        return;
      }
      forceLogout("expired");
    });
  }, [forceLogout]);

  const loadCurrentUser = useCallback(async () => {
    const existingToken = getStoredAccessToken();
    if (!existingToken) {
      setStatus("unauthenticated");
      setAuthReady(true);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setStoredUser(currentUser);
      setUser(currentUser);
      setToken(existingToken);
      setStatus("authenticated");
    } catch (error) {
      setApiStatus("unauthorized");
      forceLogout("expired");
    } finally {
      setAuthReady(true);
    }
  }, [forceLogout]);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const startOtp = useCallback(async (phoneNumber: string) => {
    const result = await startOtpService(phoneNumber);
    setPendingPhoneNumber(phoneNumber);
    setPendingSessionId(result.sessionId ?? null);
  }, []);

  const verifyOtp = useCallback(async (code: string, phoneNumber?: string) => {
    const targetPhoneNumber = phoneNumber ?? pendingPhoneNumber;
    if (!targetPhoneNumber) {
      throw new Error("Missing phone number for OTP verification");
    }
    const result = await verifyOtpService(targetPhoneNumber, code, pendingSessionId ?? undefined);
    setStoredAccessToken(result.accessToken);
    if (result.refreshToken) {
      setStoredRefreshToken(result.refreshToken);
    }
    setStoredUser(result.user);
    setToken(result.accessToken);
    setUser(result.user);
    setPendingPhoneNumber(null);
    setPendingSessionId(null);
    setAuthReady(false);
    await loadCurrentUser();
    return result;
  }, [loadCurrentUser, pendingPhoneNumber, pendingSessionId]);

  const logout = useCallback(() => {
    void logoutService().catch((error) => {
      console.error("Logout failed", error);
    });
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
    setAuthReady(true);
    setPendingPhoneNumber(null);
    setPendingSessionId(null);
    redirectToLogin();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, status, authReady, pendingPhoneNumber, pendingSessionId, startOtp, verifyOtp, logout }),
    [authReady, logout, pendingPhoneNumber, pendingSessionId, startOtp, status, token, user, verifyOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
