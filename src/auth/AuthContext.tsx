import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  logout as logoutService,
  startOtp as startOtpService,
  verifyOtp as verifyOtpService,
  type AuthenticatedUser,
  type LoginSuccess,
  type OtpStartResponse
} from "@/services/auth";
import { fetchCurrentUser } from "@/api/auth";
import { ApiError } from "@/api/client";
import {
  clearStoredAuth,
  clearStoredUser,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredRefreshToken,
  setStoredUser
} from "@/services/token";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { redirectToDashboard, redirectToLogin } from "@/services/api";
import { setApiStatus } from "@/state/apiStatus";

export type AuthStatus = "authenticated" | "unauthenticated" | "expired" | "forbidden";

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

const isValidAccessToken = (token: string | null | undefined): token is string =>
  typeof token === "string" && token.length > 50 && token.startsWith("eyJ");

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());
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
    return registerAuthFailureHandler(() => {
      setApiStatus("unauthorized");
      forceLogout("unauthenticated");
    });
  }, [forceLogout]);

  const loadCurrentUser = useCallback(async (accessToken?: string): Promise<boolean> => {
    const existingToken = accessToken ?? getStoredAccessToken();
    if (!existingToken) {
      setStatus("unauthenticated");
      setAuthReady(true);
      redirectToLogin();
      return false;
    }
    if (!isValidAccessToken(existingToken)) {
      clearStoredAuth();
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
      setAuthReady(true);
      redirectToLogin();
      return false;
    }

    setAuthReady(false);
    setStatus("unauthenticated");
    setToken(existingToken);
    setUser(null);
    clearStoredUser();

    try {
      const currentUser = await fetchCurrentUser();
      setStoredUser(currentUser);
      setUser(currentUser);
      setStatus("authenticated");
      setAuthReady(true);
      redirectToDashboard();
      return true;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setApiStatus("unauthorized");
        forceLogout("unauthenticated");
        return false;
      }

      setApiStatus("unauthorized");
      forceLogout("unauthenticated");
      return false;
    } finally {
      setAuthReady(true);
    }
  }, [forceLogout]);

  useEffect(() => {
    const existingToken = getStoredAccessToken();
    if (!existingToken || !isValidAccessToken(existingToken)) {
      if (existingToken) {
        clearStoredAuth();
      }
      setStatus("unauthenticated");
      setAuthReady(true);
      redirectToLogin();
      return;
    }
    setToken(existingToken);
    void loadCurrentUser(existingToken);
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
    const { accessToken, refreshToken } = result;
    if (!accessToken) {
      clearStoredAuth();
      throw new Error("Missing access token from OTP verification");
    }
    setStoredAccessToken(accessToken);
    if (refreshToken) {
      setStoredRefreshToken(refreshToken);
    }
    if (!isValidAccessToken(accessToken)) {
      clearStoredAuth();
      throw new Error("Invalid access token from OTP verification");
    }
    setToken(accessToken);
    setPendingPhoneNumber(null);
    setAuthReady(false);
    const didLoadUser = await loadCurrentUser(accessToken);
    if (!didLoadUser) {
      throw new Error("Unable to load current user");
    }
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
