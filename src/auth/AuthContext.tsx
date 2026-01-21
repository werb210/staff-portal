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
  getStoredUser,
  setStoredAccessToken,
  setStoredUser
} from "@/services/token";
import { getAccessToken } from "@/lib/authToken";
import { registerAuthFailureHandler } from "@/auth/authEvents";

export type AuthState = "unauthenticated" | "authenticated_pending" | "authenticated";
export type AuthStatus = AuthState;
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
  pendingPhoneNumber: string | null;
  startOtp: (payload: StartOtpPayload) => Promise<boolean>;
  verifyOtp: (payload: VerifyOtpPayload | string, code?: string) => Promise<boolean>;
  login: (token: string) => Promise<void>;
  setAuth: (payload: SetAuthPayload) => void;
  setUser: (user: AuthenticatedUser | null) => void;
  setAuthenticated: () => void;
  setAuthState: (state: AuthState) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export type AuthContextType = AuthContextValue;

const fallbackAccessToken = getAccessToken();
const fallbackAuthState: AuthState = fallbackAccessToken ? "authenticated_pending" : "unauthenticated";
const fallbackRolesStatus: RolesStatus = fallbackAccessToken ? "loading" : "resolved";

const defaultAuthContext: AuthContextValue = {
  authState: fallbackAuthState,
  authStatus: fallbackAuthState,
  rolesStatus: fallbackRolesStatus,
  user: null,
  accessToken: fallbackAccessToken,
  error: null,
  authenticated: fallbackAuthState === "authenticated",
  isAuthenticated: fallbackAuthState === "authenticated",
  authReady: fallbackAuthState !== "authenticated_pending",
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

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const storedAccessToken = getAccessToken();
  const hasAccessToken = Boolean(storedAccessToken);
  const [authState, setAuthState] = useState<AuthState>(() =>
    hasAccessToken ? "authenticated_pending" : "unauthenticated"
  );
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>(() =>
    hasAccessToken ? "loading" : "resolved"
  );
  const [user, setUserState] = useState<AuthenticatedUser | null>(() =>
    getStoredUser<AuthenticatedUser>()
  );
  const [accessToken, setAccessTokenState] = useState<string | null>(() => storedAccessToken);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const previousStatus = useRef<AuthState | null>(null);

  const setUser = useCallback((nextUser: AuthenticatedUser | null) => {
    setUserState(nextUser ?? null);
    setStoredUser(nextUser ?? null);
  }, []);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    setAccessTokenState(null);
    setUserState(null);
    setAuthState("unauthenticated");
    setRolesStatus("resolved");
    setError(null);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const forceLogout = useCallback(
    async (reason: string) => {
      logAuthInfo("Auth forced logout", user, { reason });
      clearAuthState();
    },
    [clearAuthState, user]
  );

  const setAuth = useCallback(
    ({ user: newUser }: SetAuthPayload) => {
      setUser(newUser ?? null);
      if (!getAccessToken()) {
        setAuthState("unauthenticated");
      } else if (newUser) {
        setAuthState("authenticated");
      } else {
        setAuthState("authenticated_pending");
      }
      setRolesStatus("resolved");
      setError(null);
    },
    [setUser]
  );

  const setAuthenticated = useCallback(() => {
    setAuthState("authenticated");
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (!getAccessToken()) {
      clearAuthState();
      return false;
    }
    setAuthState("authenticated_pending");
    setRolesStatus("loading");
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        clearAuthState();
        return false;
      }
      const ct = res.headers.get("content-type");
      if (!ct || !ct.includes("application/json")) {
        clearAuthState();
        return false;
      }
      const data = (await res.json()) as AuthenticatedUser;
      setUser(data ?? null);
      setAuthState("authenticated");
      setRolesStatus("resolved");
      return true;
    } catch (fetchError) {
      logAuthError("/api/auth/me failed", user, { error: fetchError });
      clearAuthState();
      return false;
    }
  }, [clearAuthState, setUser, user]);

  const login = useCallback(async (token: string): Promise<void> => {
    setStoredAccessToken(token);
    setAccessTokenState(token);
    setAuthState("authenticated_pending");
    setRolesStatus("loading");
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!accessToken) {
        if (!isMounted) return;
        setUserState(null);
        setAuthState("unauthenticated");
        setRolesStatus("resolved");
        setError(null);
        return;
      }
      if (!isMounted) return;
      setAuthState("authenticated_pending");
      setRolesStatus("loading");
      const storedUser = getStoredUser<AuthenticatedUser>();
      if (storedUser) {
        setUserState(storedUser);
      }
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!isMounted) return;
        if (!res.ok) {
          clearAuthState();
          return;
        }
        const ct = res.headers.get("content-type");
        if (!ct || !ct.includes("application/json")) {
          clearAuthState();
          return;
        }
        const data = (await res.json()) as AuthenticatedUser;
        setUser(data ?? null);
        setAuthState("authenticated");
        setRolesStatus("resolved");
      } catch (fetchError) {
        if (!isMounted) return;
        logAuthError("/api/auth/me failed", null, { error: fetchError });
        clearAuthState();
        setUiFailure({
          message: "Authentication failed while validating credentials.",
          details: `Request ID: ${getRequestId()}`,
          timestamp: Date.now()
        });
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearAuthState, setUser]);

  useEffect(() => {
    const unregister = registerAuthFailureHandler((reason) => {
      void forceLogout(reason);
    });
    return () => {
      unregister();
    };
  }, [forceLogout]);

  useEffect(() => {
    if (!previousStatus.current) {
      previousStatus.current = authState;
      return;
    }

    const prior = previousStatus.current;
    if (prior !== authState) {
      if (prior === "unauthenticated" && authState === "authenticated") {
        logAuthInfo("Auth transition unauthenticated → authenticated", user);
      }
      if (prior === "authenticated" && authState === "unauthenticated") {
        logAuthInfo("Auth transition authenticated → unauthenticated", user);
      }
    }
    previousStatus.current = authState;
  }, [authState, user]);

  const startOtp = useCallback(
    async ({ phone }: StartOtpPayload): Promise<boolean> => {
      setError(null);
      try {
        logAuthInfo("OTP start request fired", user, { phone });
        const result = await startOtpService({ phone });
        // HTTP 204 is treated as success with no body.
        if (result === null) {
          setPendingPhoneNumber(phone);
          return true;
        }
        const headers = result.headers ?? {};
        const headerKey = Object.keys(headers).find((key) => key.toLowerCase() === "x-twilio-sid");
        const twilioSid =
          result.data?.twilioSid ??
          result.data?.sid ??
          (headerKey ? headers[headerKey] : undefined);
        if (!twilioSid) {
          setError("OTP pending. Please retry.");
          return false;
        }
        setPendingPhoneNumber(phone);
        return true;
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP failed";
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
        typeof payload === "string" ? { phone: payload, code: codeArg ?? "" } : payload;
      const phoneNumber = resolvedPayload.phone ?? pendingPhoneNumber ?? "";

      try {
        logAuthInfo("OTP verify request fired", user, { phone: phoneNumber });
        const response = await verifyOtpService({ phone: phoneNumber, code: resolvedPayload.code });
        if (!response?.accessToken) {
          setError("OTP verification missing access token");
          return false;
        }
        await login(response.accessToken);
        return true;
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP verification failed";
        setError(message);
        return false;
      } finally {
        setPendingPhoneNumber(null);
      }
    },
    [login, pendingPhoneNumber, user]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutService();
    } catch (error) {
      logAuthError("Logout failed", user, { error });
    }
    clearAuthState();
  }, [clearAuthState, user]);

  const isAuthenticated = authState === "authenticated";

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      authState,
      authStatus: authState,
      rolesStatus,
      user,
      accessToken,
      error,
      authenticated: isAuthenticated,
      isAuthenticated,
      authReady: authState !== "authenticated_pending",
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setUser,
      setAuthenticated,
      setAuthState,
      clearAuth,
      refreshUser,
      logout
    }),
    [
      authState,
      rolesStatus,
      user,
      accessToken,
      error,
      isAuthenticated,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setUser,
      setAuthenticated,
      setAuthState,
      clearAuth,
      refreshUser,
      logout
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultAuthContext;
}
