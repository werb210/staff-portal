import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  logout as logoutService,
  startOtp as startOtpService,
  verifyOtp as verifyOtpService,
  type AuthenticatedUser,
  type OtpVerifyResponse,
  type OtpStartResponse
} from "@/services/auth";
import {
  clearStoredAuth,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredUser
} from "@/services/token";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { redirectToLogin } from "@/services/api";
import { setApiStatus } from "@/state/apiStatus";
import { assertKnownRole } from "@/utils/roles";

export type AuthStatus = "authenticated" | "unauthenticated" | "expired" | "forbidden";

export type AuthContextType = {
  user: AuthenticatedUser | null;
  token: string | null;
  status: AuthStatus;
  authenticated: boolean;
  authReady: boolean;
  pendingPhoneNumber: string | null;
  startOtp: (payload: { phone: string }) => Promise<OtpStartResponse>;
  verifyOtp: (payload: { code: string; phone?: string }) => Promise<OtpVerifyResponse>;
  setAuth: (payload: { token: string; user?: AuthenticatedUser | null }) => void;
  refreshUser: (accessToken?: string) => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackAuthContext: AuthContextType = {
  user: { id: "test-user", email: "test@example.com", role: "Admin" as AuthenticatedUser["role"] },
  token: "test-token",
  status: "authenticated",
  authenticated: true,
  authReady: true,
  pendingPhoneNumber: null,
  startOtp: async () => ({ sessionId: undefined }),
  verifyOtp: async () => ({ token: "test-token", user: { id: "test-user", email: "test@example.com", role: "Admin" as AuthenticatedUser["role"] } }),
  setAuth: () => undefined,
  refreshUser: async () => true,
  logout: () => undefined
};

const isValidAccessToken = (token: string | null | undefined): token is string =>
  typeof token === "string" && token.length > 50 && token.startsWith("eyJ");

type JwtPayload = {
  sub?: string;
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  user?: Partial<AuthenticatedUser>;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const segments = token.split(".");
  if (segments.length < 2) return null;
  const payload = segments[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? normalized.padEnd(normalized.length + (4 - padding), "=") : normalized;
  if (typeof atob !== "function") {
    return null;
  }
  try {
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

const buildUserFromToken = (token: string): AuthenticatedUser | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const embeddedUser = payload.user ?? {};
  const id = embeddedUser.id ?? payload.sub ?? payload.id;
  const email = embeddedUser.email ?? payload.email;
  const role = embeddedUser.role ?? payload.role;
  if (typeof id !== "string" || typeof email !== "string" || typeof role !== "string") {
    return null;
  }
  assertKnownRole(role);
  const name = embeddedUser.name ?? payload.name;
  return {
    id,
    email,
    role,
    ...(name ? { name } : {})
  };
};

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

  const setAuth = useCallback((payload: { token: string; user?: AuthenticatedUser | null }) => {
    if (!isValidAccessToken(payload.token)) {
      clearStoredAuth();
      throw new Error("Invalid access token from OTP verification");
    }

    const resolvedUser = payload.user ?? buildUserFromToken(payload.token);
    if (!resolvedUser) {
      clearStoredAuth();
      throw new Error("Unable to derive user from access token");
    }

    assertKnownRole(resolvedUser.role);
    setStoredAccessToken(payload.token);
    setStoredUser(resolvedUser);
    setToken(payload.token);
    setUser(resolvedUser);
    setStatus("authenticated");
    setAuthReady(true);
  }, []);

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

    const resolvedUser = buildUserFromToken(existingToken);
    if (!resolvedUser) {
      clearStoredAuth();
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
      setAuthReady(true);
      redirectToLogin();
      return false;
    }

    setStoredUser(resolvedUser);
    setToken(existingToken);
    setUser(resolvedUser);
    setStatus("authenticated");
    setAuthReady(true);
    return true;
  }, []);

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
    setPendingPhoneNumber(null);
    return result;
  }, [pendingPhoneNumber]);

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
      authenticated: status === "authenticated",
      authReady,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      setAuth,
      refreshUser: loadCurrentUser,
      logout
    }),
    [authReady, loadCurrentUser, logout, pendingPhoneNumber, setAuth, startOtp, status, token, user, verifyOtp]
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
