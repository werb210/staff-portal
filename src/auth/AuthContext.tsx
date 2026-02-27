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
import { normalizeRole, type Role } from "@/auth/roles";
import { useDialerStore } from "@/state/dialer.store";

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
  role: Role | null;
  roles: Role[];
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

const normalizeUserRoles = (user: AuthUser): Role[] => {
  if (!user) return [];
  const source = Array.isArray(user.roles) && user.roles.length ? user.roles : user.role ? [user.role] : [];
  return source
    .map((entry) => normalizeRole(entry))
    .filter((entry): entry is Role => entry !== null);
};

const normalizeAuthUser = (user: AuthUser): AuthUser => {
  if (!user) return null;
  const role = normalizeRole(user.role ?? null);
  return {
    ...user,
    role: role ?? undefined,
    roles: normalizeUserRoles(user)
  };
};

const TEST_AUTH_STUB: AuthContextValue = {
  authState: "authenticated",
  status: "authenticated",
  authStatus: "authenticated",
  rolesStatus: "resolved",
  user: { id: "test-user", email: "staff@example.com", role: "Staff" },
  accessToken: "test-token",
  role: "Staff",
  roles: ["Staff"],
  capabilities: [],
  error: null,
  pendingPhoneNumber: null,
  authenticated: true,
  isAuthenticated: true,
  isLoading: false,
  authReady: true,
  isHydratingSession: false,
  login: async () => false,
  startOtp: async () => true,
  verifyOtp: async () => true,
  loginWithOtp: async () => true,
  refreshUser: async () => true,
  clearAuth: () => undefined,
  logout: async () => {
    localStorage.removeItem("persist");
  },
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
    localStorage.clear();
    sessionStorage.clear();
    localStorage.removeItem("persist");
    sessionStorage.removeItem("persist");
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
      let nextUser: AuthUser = null;
      try {
        const profile = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: false
        });
        nextUser = normalizeAuthUser(profile.data?.user ?? profile.data);
      } catch {
        nextUser = null;
      }

      if (!nextUser) {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include"
        });
        if (!response.ok) throw new Error("Unable to hydrate auth session.");
        nextUser = normalizeAuthUser(await response.json());
      }
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
    setPendingPhoneNumber(phone);
    setAuthStatus("pending");
    setRolesStatus("pending");
    await startOtpService({ phone });
    return true;
  }, []);

  const verifyOtp = useCallback(async ({ phone, code }: OtpVerifyPayload) => {
    setAuthStateState("loading");
    setAuthStatus("loading");
    setRolesStatus("loading");
    const tokens = await verifyOtpService({ phone, code });
    setStoredAccessToken(tokens.accessToken);
    setAccessToken(tokens.accessToken);
    setPendingPhoneNumber(null);
    return refreshUser(tokens.accessToken);
  }, [refreshUser]);

  const login = useCallback(async () => false, []);
  const loginWithOtp = verifyOtp;

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      clearAuth();
      useDialerStore.getState().closeDialer();
      useDialerStore.getState().resetCall();
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          registration.active?.postMessage({ type: "CLEAR_CACHES" });
        } catch {
          // ignore service worker readiness issues
        }
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    }
  }, [clearAuth]);

  const isAuthenticated = authState === "authenticated";
  const isLoading = authState === "loading";

  const value = useMemo<AuthContextValue>(() => ({
    authState,
    status: authStatus,
    authStatus,
    rolesStatus,
    user,
    accessToken,
    role: normalizeRole(user?.role ?? null),
    roles: normalizeUserRoles(user),
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
    setAuth: setUserState,
    setUser: setUserState,
    setAuthenticated: () => undefined,
    setAuthState: setAuthStateState
  }), [
    authState,
    authStatus,
    rolesStatus,
    user,
    accessToken,
    error,
    pendingPhoneNumber,
    isAuthenticated,
    isHydratingSession,
    isLoading,
    login,
    startOtp,
    verifyOtp,
    loginWithOtp,
    refreshUser,
    clearAuth,
    logout
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
