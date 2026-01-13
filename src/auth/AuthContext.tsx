import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { logout as logoutService, refresh as refreshService, startOtp as startOtpService, verifyOtp as verifyOtpService, type AuthenticatedUser, type LoginSuccess, type OtpStartResponse } from "@/services/auth";
import { fetchCurrentUser } from "@/api/auth";
import { ApiError } from "@/api/client";
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
  startOtp: (payload: { phone: string }) => Promise<OtpStartResponse>;
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
        forceLogout("unauthenticated");
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
      redirectToLogin();
      return;
    }

    setStatus("authenticated");
    setToken(existingToken);

    try {
      const currentUser = await fetchCurrentUser();
      setStoredUser(currentUser);
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setApiStatus("forbidden");
        forceLogout("unauthenticated");
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        try {
          const refreshed = await refreshService();
          setStoredAccessToken(refreshed.accessToken);
          if (refreshed.refreshToken) {
            setStoredRefreshToken(refreshed.refreshToken);
          }
          if (refreshed.user) {
            setStoredUser(refreshed.user);
          }
          setToken(refreshed.accessToken);
          const currentUser = await fetchCurrentUser();
          setStoredUser(currentUser);
          setUser(currentUser);
          setStatus("authenticated");
          setAuthReady(true);
          return;
        } catch (refreshError) {
          console.error("Token refresh failed.", refreshError);
        }
      }

      setApiStatus("unauthorized");
      forceLogout("expired");
    } finally {
      setAuthReady(true);
    }
  }, [forceLogout]);

  useEffect(() => {
    const existingToken = getStoredAccessToken();
    if (!existingToken) {
      setStatus("unauthenticated");
      setAuthReady(true);
      redirectToLogin();
      return;
    }
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const startOtp = useCallback(async ({ phone }: { phone: string }) => {
    const response = await startOtpService({ phone });
    setPendingPhoneNumber(phone);
    return response;
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
    if (!result.refreshToken) {
      throw new Error("Missing refresh token from OTP verification");
    }
    setStoredRefreshToken(result.refreshToken);
    setStoredUser(result.user);
    setStatus("authenticated");
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
