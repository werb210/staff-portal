import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { startOtp as startOtpService, verifyOtp as verifyOtpService, logout as logoutService } from "@/services/auth";
import {
  clearStoredAuth,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredUser,
} from "@/services/token";
import type { AuthenticatedUser } from "@/services/auth";

export type AuthStatus = "idle" | "pending" | "loading" | "authenticated" | "unauthenticated";
export type RolesStatus = "pending" | "loading" | "resolved" | "ready";
export type AuthState = "loading" | "authenticated" | "unauthenticated";

export type AuthUser = (AuthenticatedUser & {
  id?: string;
  email?: string;
  role?: string;
  capabilities?: string[];
  roles?: string[];
}) | null;

export type OtpStartPayload = { phone: string };
export type OtpVerifyPayload = { phone: string; code: string };

export type AuthContextValue = {
  authState: AuthState;
  status: AuthStatus;
  authStatus: AuthStatus;
  rolesStatus: RolesStatus;
  user: AuthUser;
  accessToken: string | null;
  role: string | null;
  roles: string[];
  capabilities: string[];
  error: string | null;
  pendingPhoneNumber: string | null;
  authenticated: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authReady: boolean;
  isHydratingSession: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  startOtp: (payload: OtpStartPayload) => Promise<boolean>;
  verifyOtp: (payload: OtpVerifyPayload) => Promise<boolean>;
  loginWithOtp: (payload: OtpVerifyPayload) => Promise<boolean>;
  refreshUser: (tokenOverride?: string | null) => Promise<boolean>;
  clearAuth: () => void;
  logout: () => Promise<void>;
  setAuth: (user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setAuthState: (state: AuthState) => void;
};

export type AuthContextType = AuthContextValue;

const TEST_AUTH_STUB: AuthContextValue = {
  authState: "unauthenticated",
  status: "unauthenticated",
  authStatus: "unauthenticated",
  rolesStatus: "resolved",
  user: null,
  accessToken: null,
  role: null,
  roles: [],
  capabilities: [],
  error: null,
  pendingPhoneNumber: null,
  authenticated: false,
  isAuthenticated: false,
  isLoading: false,
  authReady: true,
  isHydratingSession: false,
  login: async () => false,
  startOtp: async () => false,
  verifyOtp: async () => false,
  loginWithOtp: async () => false,
  refreshUser: async () => false,
  clearAuth: () => undefined,
  logout: async () => undefined,
  setAuth: () => undefined,
  setUser: () => undefined,
  setAuthenticated: () => undefined,
  setAuthState: () => undefined
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AuthUser>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authState, setAuthStateState] = useState<AuthState>("loading");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>("loading");
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHydratingSession, setIsHydratingSession] = useState(true);

  const clearAuth = useCallback(() => {
    clearStoredAuth();
    setUserState(null);
    setAccessToken(null);
    setPendingPhoneNumber(null);
    setError(null);
    setAuthStateState("unauthenticated");
    setAuthStatus("unauthenticated");
    setRolesStatus("resolved");
    setIsHydratingSession(false);
  }, []);

  const refreshUser = useCallback(async (tokenOverride?: string | null) => {
    const token = tokenOverride ?? accessToken ?? getStoredAccessToken();
    if (!token) {
      clearAuth();
      return false;
    }

    setAuthStateState("loading");
    setAuthStatus("loading");
    setRolesStatus("loading");
    setIsHydratingSession(true);

    try {
      const profile = await api.get<Exclude<AuthUser, null> | { user?: Exclude<AuthUser, null> }>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nextUser = ("user" in profile.data && profile.data.user ? profile.data.user : profile.data) as Exclude<AuthUser, null>;
      setStoredAccessToken(token);
      setStoredUser(nextUser);
      setAccessToken(token);
      setUserState(nextUser);
      setAuthStateState("authenticated");
      setAuthStatus("authenticated");
      setRolesStatus("resolved");
      setError(null);
      return true;
    } catch {
      clearAuth();
      return false;
    } finally {
      setIsHydratingSession(false);
    }
  }, [accessToken, clearAuth]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      clearAuth();
      return;
    }
    void refreshUser(token);
  }, [clearAuth, refreshUser]);

  const startOtp = useCallback(async ({ phone }: OtpStartPayload) => {
    setError(null);
    setPendingPhoneNumber(phone);
    setAuthStatus("pending");
    setRolesStatus("pending");
    await startOtpService({ phone });
    return true;
  }, []);

  const verifyOtp = useCallback(async ({ phone, code }: OtpVerifyPayload) => {
    setError(null);
    setAuthStateState("loading");
    setAuthStatus("loading");
    setRolesStatus("loading");
    const tokens = await verifyOtpService({ phone, code });
    setStoredAccessToken(tokens.accessToken);
    setAccessToken(tokens.accessToken);
    setPendingPhoneNumber(null);
    return refreshUser(tokens.accessToken);
  }, [refreshUser]);

  const loginWithOtp = useCallback(async (payload: OtpVerifyPayload) => {
    return verifyOtp(payload);
  }, [verifyOtp]);

  const login = useCallback(async (_email: string, _password: string) => false, []);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const setAuth = useCallback((nextUser: AuthUser) => {
    setUserState(nextUser);
    const isAuthed = Boolean(nextUser);
    setAuthStateState(isAuthed ? "authenticated" : "unauthenticated");
    setAuthStatus(isAuthed ? "authenticated" : "unauthenticated");
    setRolesStatus("resolved");
  }, []);

  const setUser = useCallback((nextUser: AuthUser) => {
    setUserState(nextUser);
  }, []);

  const setAuthenticated = useCallback((authenticated: boolean) => {
    setAuthStateState(authenticated ? "authenticated" : "unauthenticated");
    setAuthStatus(authenticated ? "authenticated" : "unauthenticated");
    if (authenticated) {
      setRolesStatus("resolved");
    }
  }, []);

  const setAuthState = useCallback((state: AuthState) => {
    setAuthStateState(state);
    setAuthStatus(state);
    if (state === "authenticated" || state === "unauthenticated") {
      setRolesStatus("resolved");
    }
  }, []);

  const isAuthenticated = authState === "authenticated";
  const isLoading = authState === "loading";

  const value = useMemo<AuthContextValue>(() => ({
    authState,
    status: authStatus,
    authStatus,
    rolesStatus,
    user,
    accessToken,
    role: user?.role ?? null,
    roles: user?.roles ?? (user?.role ? [user.role] : []),
    capabilities: user?.capabilities ?? [],
    error,
    pendingPhoneNumber,
    authenticated: isAuthenticated,
    isAuthenticated,
    isLoading,
    authReady: !isHydratingSession,
    isHydratingSession,
    login,
    startOtp,
    verifyOtp,
    loginWithOtp,
    refreshUser,
    clearAuth,
    logout,
    setAuth,
    setUser,
    setAuthenticated,
    setAuthState
  }), [
    accessToken,
    authState,
    authStatus,
    clearAuth,
    error,
    isAuthenticated,
    isHydratingSession,
    isLoading,
    login,
    loginWithOtp,
    logout,
    pendingPhoneNumber,
    refreshUser,
    rolesStatus,
    setAuth,
    setAuthState,
    setAuthenticated,
    setUser,
    startOtp,
    user,
    verifyOtp
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (process.env.NODE_ENV === "test") {
      return TEST_AUTH_STUB;
    }
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
