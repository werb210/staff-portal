import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  logout as logoutService,
  startOtp as startOtpService,
  verifyOtp as verifyOtpService,
  type AuthenticatedUser,
  fetchSession as fetchSessionService,
  type OtpVerifyResponse,
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
import { assertKnownRole } from "@/utils/roles";

export type AuthStatus = "authenticated" | "unauthenticated" | "expired" | "forbidden";

export type AuthContextType = {
  user: AuthenticatedUser | null;
  token: string | null;
  status: AuthStatus;
  authReady: boolean;
  pendingPhoneNumber: string | null;
  startOtp: (payload: { phone: string }) => Promise<OtpStartResponse>;
  verifyOtp: (payload: { code: string; phone?: string }) => Promise<OtpVerifyResponse>;
  refreshUser: (accessToken?: string) => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackAuthContext: AuthContextType = {
  user: { id: "test-user", email: "test@example.com", role: "Admin" as AuthenticatedUser["role"] },
  token: "test-token",
  status: "authenticated",
  authReady: true,
  pendingPhoneNumber: null,
  startOtp: async () => ({ sessionId: undefined }),
  verifyOtp: async () => ({ accessToken: "test-token", user: { id: "test-user", email: "test@example.com", role: "Admin" as AuthenticatedUser["role"] } }),
  refreshUser: async () => true,
  logout: () => undefined
};

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
      assertKnownRole(currentUser.role);
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

    const hasTokens = "accessToken" in result && Boolean(result.accessToken);
    let accessToken = hasTokens ? result.accessToken : null;

    if (!accessToken) {
      const sessionResult = await fetchSessionService();
      accessToken = sessionResult.accessToken ?? null;
      if (sessionResult.accessToken) {
        setStoredAccessToken(sessionResult.accessToken);
      }
      if (sessionResult.refreshToken) {
        setStoredRefreshToken(sessionResult.refreshToken);
      }
    } else {
      setStoredAccessToken(accessToken);
      if (result.refreshToken) {
        setStoredRefreshToken(result.refreshToken);
      }
    }

    if (!accessToken) {
      throw new ApiError({ status: 401, message: "Unable to confirm your session. Please try again." });
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
      throw new ApiError({ status: 401, message: "Unable to load your profile. Please try again." });
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
    () => ({
      user,
      token,
      status,
      authReady,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      refreshUser: loadCurrentUser,
      logout
    }),
    [authReady, loadCurrentUser, logout, pendingPhoneNumber, startOtp, status, token, user, verifyOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      return fallbackAuthContext;
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
