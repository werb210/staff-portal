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
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { code: string; phone?: string }) => Promise<LoginSuccess>;
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

  const startOtp = useCallback(async ({ phone }: { phone: string }) => {
    await startOtpService({ phone });
    setPendingPhoneNumber(phone);
  }, []);

  const verifyOtp = useCallback(async ({ code, phone }: { code: string; phone?: string }) => {
    const targetPhoneNumber = phone ?? pendingPhoneNumber;
    if (!targetPhoneNumber) {
      throw new Error("Missing phone number for OTP verification");
    }
    const result = await verifyOtpService({
      phone: targetPhoneNumber,
      code
    });
    setStoredAccessToken(result.accessToken);
    if (result.refreshToken) {
      setStoredRefreshToken(result.refreshToken);
    }
    setStoredUser(result.user);
    setToken(result.accessToken);
    setUser(result.user);
    setPendingPhoneNumber(null);
    setAuthReady(false);
    await loadCurrentUser();
    return result;
  }, [loadCurrentUser, pendingPhoneNumber]);

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
    redirectToLogin();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, status, authReady, pendingPhoneNumber, startOtp, verifyOtp, logout }),
    [authReady, logout, pendingPhoneNumber, startOtp, status, token, user, verifyOtp]
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
