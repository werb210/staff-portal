import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";

import type { AuthenticatedUser } from "@/services/auth";
import {
  startOtp as startOtpService,
  verifyOtp as verifyOtpService,
  logout as logoutService
} from "@/services/auth";
import { getRequestId } from "@/utils/requestId";
import { setUiFailure } from "@/utils/uiFailureStore";
import {
  clearStoredAuth,
  setStoredAccessToken,
  getStoredUser,
  setStoredUser
} from "@/services/token";
import { getAccessToken } from "@/lib/authToken";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import api from "@/lib/api";
import { setAuthTelemetryContext } from "@/utils/uiTelemetry";
import type { UserRole } from "@/utils/roles";
import { clearSession, readSession, writeSession } from "@/utils/sessionStore";
import { buildNotification } from "@/utils/notifications";
import { useNotificationsStore } from "@/state/notifications.store";
import type { NotificationItem } from "@/types/notifications";
import { clearClientStorage, clearServiceWorkerCaches } from "@/utils/sessionCleanup";
import { performLogoutCleanup } from "@/auth/logout";
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type AuthState = AuthStatus;
export type RolesStatus = "loading" | "resolved";

interface SetAuthPayload {
  user: AuthenticatedUser | null;
}

interface StartOtpPayload {
  phone: string;
}

interface VerifyOtpPayload {
  phone?: string;
  code: string;
}

export interface AuthContextValue {
  authState: AuthState;
  authStatus: AuthStatus;
  rolesStatus: RolesStatus;
  user: AuthenticatedUser | null;
  accessToken: string | null;
  error: string | null;
  authenticated: boolean;
  isAuthenticated: boolean;
  authReady: boolean;
  isHydratingSession: boolean;
  pendingPhoneNumber: string | null;
  startOtp: (payload: StartOtpPayload | string) => Promise<boolean>;
  verifyOtp: (payload: VerifyOtpPayload | string, code?: string) => Promise<boolean>;
  login: (token: string) => Promise<void>;
  setAuth: (payload: SetAuthPayload) => void;
  setUser: (user: AuthenticatedUser | null) => void;
  setAuthenticated: () => void;
  setAuthState: (state: AuthState) => void;
  clearAuth: () => void;
  refreshUser: (options?: { allowLogout?: boolean }) => Promise<boolean>;
  logout: () => Promise<void>;
}

export type AuthContextType = AuthContextValue;

const buildFallbackAuthContext = (): AuthContextValue => {
  const fallbackAccessToken = getAccessToken();
  const fallbackAuthState: AuthState = fallbackAccessToken ? "loading" : "unauthenticated";
  const fallbackRolesStatus: RolesStatus = fallbackAccessToken ? "loading" : "resolved";

  return {
    authState: fallbackAuthState,
    authStatus: fallbackAuthState,
    rolesStatus: fallbackRolesStatus,
    user: null,
    accessToken: fallbackAccessToken,
    error: null,
    authenticated: fallbackAuthState === "authenticated",
    isAuthenticated: fallbackAuthState === "authenticated",
    authReady: fallbackAuthState !== "loading",
    isHydratingSession: false,
    pendingPhoneNumber: null,
    startOtp: async () => false,
    verifyOtp: async () => false,
    login: async () => undefined,
    setAuth: () => undefined,
    setUser: () => undefined,
    setAuthenticated: () => undefined,
    setAuthState: () => undefined,
    clearAuth: () => undefined,
    refreshUser: async () => false,
    logout: async () => undefined
  };
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const buildAuthLogContext = (user?: AuthenticatedUser | null) => ({
  requestId: getRequestId(),
  userId: (user as { id?: string } | null)?.id ?? null,
  role: (user as { role?: string } | null)?.role ?? null
});

const logAuthInfo = (
  message: string,
  user?: AuthenticatedUser | null,
  extra?: Record<string, unknown>
) => {
  console.info(message, { ...buildAuthLogContext(user), ...extra });
};

const logAuthError = (
  message: string,
  user?: AuthenticatedUser | null,
  extra?: Record<string, unknown>
) => {
  console.error(message, { ...buildAuthLogContext(user), ...extra });
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }
  return undefined;
};

const emitNotification = (payload: { title?: string; body?: string; url?: string; type?: string }) => {
  const notification: NotificationItem = buildNotification(
    {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      type: payload.type as NotificationItem["type"]
    },
    "in_app"
  );
  useNotificationsStore.getState().addNotification(notification);
};

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const storedAccessToken = getAccessToken();
  const storedUser = storedAccessToken ? getStoredUser<AuthenticatedUser>() : null;
  const hasAccessToken = Boolean(storedAccessToken);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() =>
    storedUser ? "authenticated" : hasAccessToken ? "loading" : "unauthenticated"
  );
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>(() =>
    storedUser ? "resolved" : hasAccessToken ? "loading" : "resolved"
  );
  const [user, setUserState] = useState<AuthenticatedUser | null>(storedUser ?? null);
  const [accessToken, setAccessTokenState] = useState<string | null>(() => storedAccessToken);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const previousStatus = useRef<AuthStatus | null>(null);
  const previousRoleRef = useRef<UserRole | null>(null);
  const skipNextHydrationRef = useRef(false);
  const initAuthRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);
  const refreshRetryRef = useRef(0);
  const authFailureInFlightRef = useRef(false);
  const [isHydratingSession, setIsHydratingSession] = useState<boolean>(() => !hasAccessToken);
  const hasHydratedSessionRef = useRef(false);

  const setUser = useCallback((nextUser: AuthenticatedUser | null) => {
    setUserState(nextUser ?? null);
    setStoredUser(nextUser ?? null);
  }, []);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    void clearSession();
    clearClientStorage();
    void clearServiceWorkerCaches();
    setAccessTokenState(null);
    setUserState(null);
    setAuthStatus("unauthenticated");
    setRolesStatus("resolved");
    setError(null);
    setPendingPhoneNumber(null);
    setIsHydratingSession(false);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const setAuth = useCallback(
    ({ user: newUser }: SetAuthPayload) => {
      setUser(newUser ?? null);
      if (!getAccessToken()) {
        setAuthStatus("unauthenticated");
      } else if (newUser) {
        setAuthStatus("authenticated");
      } else {
        setAuthStatus("loading");
      }
      setRolesStatus("resolved");
      setError(null);
    },
    [setUser]
  );

  const setAuthenticated = useCallback(() => {
    setAuthStatus("authenticated");
    setRolesStatus("resolved");
    setError(null);
  }, []);

  const refreshUser = useCallback(
    async (options?: { allowLogout?: boolean }): Promise<boolean> => {
      const allowLogout = options?.allowLogout !== false;
      const priorAuthStatus = authStatus;
      const priorRolesStatus = rolesStatus;
      const priorUser = user;
      if (refreshInFlightRef.current) {
        return refreshInFlightRef.current;
      }
      const refreshPromise = (async () => {
        if (!getAccessToken()) {
          clearAuthState();
          return false;
        }
        if (allowLogout) {
          setAuthStatus("loading");
          setRolesStatus("loading");
        }
        try {
          const response = await api.get<AuthenticatedUser>("/auth/me");
          const data = response.data;
          setUser(data ?? null);
          setAuthStatus("authenticated");
          setRolesStatus("resolved");
          refreshRetryRef.current = 0;
          return true;
        } catch (fetchError) {
          const status = getErrorStatus(fetchError);
          logAuthError("/api/auth/me failed", user, { error: fetchError, status });
          if (status === 401) {
            if (refreshRetryRef.current < 1) {
              refreshRetryRef.current += 1;
              try {
                const retryResponse = await api.get<AuthenticatedUser>("/auth/me");
                const retryData = retryResponse.data;
                setUser(retryData ?? null);
                setAuthStatus("authenticated");
                setRolesStatus("resolved");
                refreshRetryRef.current = 0;
                return true;
              } catch (retryError) {
                logAuthError("/api/auth/me retry failed", user, { error: retryError });
              }
            }
            if (allowLogout) {
              clearAuthState();
            } else {
              setAuthStatus(priorUser ? "authenticated" : priorAuthStatus);
              setRolesStatus(priorUser ? "resolved" : priorRolesStatus);
              setError("Authentication temporarily unavailable.");
            }
          } else {
            if (allowLogout) {
              setAuthStatus("loading");
              setRolesStatus("loading");
            } else {
              setAuthStatus(priorUser ? "authenticated" : priorAuthStatus);
              setRolesStatus(priorUser ? "resolved" : priorRolesStatus);
            }
            setError("Authentication temporarily unavailable.");
          }
          return false;
        }
      })();
      refreshInFlightRef.current = refreshPromise;
      try {
        return await refreshPromise;
      } finally {
        refreshInFlightRef.current = null;
      }
    },
    [authStatus, clearAuthState, rolesStatus, setUser, user]
  );

  const login = useCallback(async (token: string): Promise<void> => {
    skipNextHydrationRef.current = true;
    setStoredAccessToken(token);
    setAccessTokenState(token);
    setAuthStatus("loading");
    setRolesStatus("loading");
    setError(null);
    const refreshed = await refreshUser();
    if (refreshed) {
      emitNotification({
        title: "Login alert",
        body: "You signed in to the Staff Portal.",
        type: "auth_alert"
      });
    }
  }, [refreshUser]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (skipNextHydrationRef.current) {
        skipNextHydrationRef.current = false;
        return;
      }
      if (initAuthRef.current === accessToken) {
        return;
      }
      initAuthRef.current = accessToken;
      if (!accessToken) {
        if (isHydratingSession) {
          return;
        }
        if (!isMounted) return;
        setUserState(null);
        setAuthStatus("unauthenticated");
        setRolesStatus("resolved");
        setError(null);
        return;
      }
      if (!isMounted) return;
      const hasSnapshot = Boolean(user);
      if (!hasSnapshot) {
        setAuthStatus("loading");
        setRolesStatus("loading");
        setUserState(null);
      }
      try {
        const response = await api.get<AuthenticatedUser>("/auth/me");
        if (!isMounted) return;
        const data = response.data;
        setUser(data ?? null);
        setAuthStatus("authenticated");
        setRolesStatus("resolved");
      } catch (fetchError) {
        if (!isMounted) return;
        const status = getErrorStatus(fetchError);
        logAuthError("/api/auth/me failed", null, { error: fetchError, status });
        if (status === 401) {
          if (refreshRetryRef.current < 1) {
            refreshRetryRef.current += 1;
            try {
              const retryResponse = await api.get<AuthenticatedUser>("/auth/me");
              if (!isMounted) return;
              const retryData = retryResponse.data;
              setUser(retryData ?? null);
              setAuthStatus("authenticated");
              setRolesStatus("resolved");
              refreshRetryRef.current = 0;
              return;
            } catch (retryError) {
              logAuthError("/api/auth/me retry failed", null, { error: retryError });
            }
          }
          clearAuthState();
        } else {
          setAuthStatus(hasSnapshot ? "authenticated" : "loading");
          setRolesStatus(hasSnapshot ? "resolved" : "loading");
          setError("Authentication temporarily unavailable.");
          setUiFailure({
            message: "Authentication failed while validating credentials.",
            details: `Request ID: ${getRequestId()}`,
            timestamp: Date.now()
          });
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearAuthState, isHydratingSession, setUser, user]);

  useEffect(() => {
    if (accessToken) {
      setIsHydratingSession(false);
      return;
    }
    if (hasHydratedSessionRef.current) {
      setIsHydratingSession(false);
      return;
    }
    let isMounted = true;
    setIsHydratingSession(true);
    hasHydratedSessionRef.current = true;
    const hydrateFromIndexedDb = async () => {
      const session = await readSession();
      if (!isMounted) return;
      if (session?.accessToken) {
        setStoredAccessToken(session.accessToken);
        setAccessTokenState(session.accessToken);
        setUserState(session.user ?? null);
        setAuthStatus(session.user ? "authenticated" : "loading");
        setRolesStatus(session.user ? "resolved" : "loading");
      }
      setIsHydratingSession(false);
    };
    void hydrateFromIndexedDb();
    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken && !user) {
      void clearSession();
      return;
    }
    void writeSession({ accessToken, user });
  }, [accessToken, user]);

  useEffect(() => {
    const unregister = registerAuthFailureHandler((reason) => {
      if (authFailureInFlightRef.current) return;
      if (authStatus !== "authenticated") return;
      authFailureInFlightRef.current = true;
      void (async () => {
        try {
          if (reason === "forbidden") {
            setUiFailure({
              message: "You do not have permission to perform that action.",
              details: "Please contact an administrator if you need access.",
              timestamp: Date.now()
            });
            return;
          }
          const refreshed = await refreshUser({ allowLogout: false });
          if (refreshed) {
            return;
          }
          if (reason === "missing-token") {
            return;
          }
          if (reason === "unauthorized") {
            clearAuthState();
          }
        } finally {
          authFailureInFlightRef.current = false;
        }
      })();
    });
    return () => {
      unregister();
    };
  }, [authStatus, refreshUser]);

  useEffect(() => {
    const role = (user as { role?: UserRole } | null)?.role ?? null;
    const silo = (user as { silo?: string } | null)?.silo ?? null;
    setAuthTelemetryContext({ authStatus, role, silo });
  }, [authStatus, user]);

  useEffect(() => {
    const role = (user as { role?: UserRole } | null)?.role ?? null;
    if (previousRoleRef.current === null) {
      previousRoleRef.current = role;
      return;
    }
    if (role && previousRoleRef.current && role !== previousRoleRef.current) {
      logAuthInfo("Role drift detected", user, {
        previousRole: previousRoleRef.current,
        nextRole: role
      });
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 300);
    }
    previousRoleRef.current = role;
  }, [user]);

  useEffect(() => {
    const handleResume = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (authStatus !== "authenticated") return;
      void refreshUser();
    };

    window.addEventListener("pageshow", handleResume);
    document.addEventListener("visibilitychange", handleResume);

    return () => {
      window.removeEventListener("pageshow", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [authStatus, refreshUser]);

  useEffect(() => {
    if (!previousStatus.current) {
      previousStatus.current = authStatus;
      return;
    }

    const prior = previousStatus.current;
    if (prior !== authStatus) {
      if (prior === "unauthenticated" && authStatus === "authenticated") {
        logAuthInfo("Auth transition unauthenticated → authenticated", user);
      }
      if (prior === "authenticated" && authStatus === "unauthenticated") {
        logAuthInfo("Auth transition authenticated → unauthenticated", user);
      }
    }
    previousStatus.current = authStatus;
  }, [authStatus, user]);

  const startOtp = useCallback(
    async (payload: StartOtpPayload | string): Promise<boolean> => {
      const phone = typeof payload === "string" ? payload : payload.phone;
      setError(null);
      try {
        logAuthInfo("OTP start request fired", user, { phone });
        await startOtpService({ phone });
        emitNotification({
          title: "OTP code sent",
          body: `We sent a one-time passcode to ${phone}.`,
          type: "auth_alert"
        });
        setPendingPhoneNumber(phone);
        setError(null);
        return true;
      } catch (err: any) {
        const status = getErrorStatus(err);
        const message =
          status === 400
            ? "We could not send a code to that number. Please check and try again."
            : (err?.message as string) ?? "OTP failed";
        setError(message);
        return false;
      }
    },
    [user]
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload | string, codeArg?: string): Promise<boolean> => {
      setError(null);
      const resolvedPayload =
        typeof payload === "string"
          ? codeArg
            ? { phone: payload, code: codeArg }
            : { code: payload }
          : payload;
      const phoneNumber = resolvedPayload.phone ?? pendingPhoneNumber ?? "";

      try {
        logAuthInfo("OTP verify request fired", user, { phone: phoneNumber });
        const response = await verifyOtpService({ phone: phoneNumber, code: resolvedPayload.code });
        if (!response?.accessToken) {
          setError("OTP verification missing access token");
          return false;
        }
        skipNextHydrationRef.current = true;
        setStoredAccessToken(response.accessToken);
        setAccessTokenState(response.accessToken);
        setUser(null);
        setAuthStatus("loading");
        setRolesStatus("loading");
        setError(null);
        setPendingPhoneNumber(null);
        const refreshed = await refreshUser();
        if (!refreshed && !getAccessToken()) {
          return false;
        }
        emitNotification({
          title: "Login verified",
          body: "Your login was confirmed successfully.",
          type: "auth_alert"
        });
        return true;
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP verification failed";
        setError(message);
        return false;
      }
    },
    [pendingPhoneNumber, refreshUser, setUser, user]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutService();
    } catch (error) {
      logAuthError("Logout failed", user, { error });
    }
    await performLogoutCleanup();
    clearAuthState();
  }, [clearAuthState, user]);

  const isAuthenticated = authStatus === "authenticated";

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      authState: authStatus,
      authStatus,
      rolesStatus,
      user,
      accessToken,
      error,
      authenticated: isAuthenticated,
      isAuthenticated,
      authReady: authStatus !== "loading" && (!isHydratingSession || !accessToken),
      isHydratingSession,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setUser,
      setAuthenticated,
      setAuthState: setAuthStatus,
      clearAuth,
      refreshUser,
      logout
    }),
    [
      authStatus,
      rolesStatus,
      user,
      accessToken,
      error,
      isAuthenticated,
      isHydratingSession,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setUser,
      setAuthenticated,
      setAuthStatus,
      clearAuth,
      refreshUser,
      logout
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx ?? buildFallbackAuthContext();
}
