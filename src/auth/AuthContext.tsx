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
import { fetchCurrentUser } from "@/api/auth";
import { setUiFailure } from "@/utils/uiFailureStore";
import {
  clearStoredAuth,
  getStoredUser,
  setStoredAccessToken,
  setStoredUser
} from "@/services/token";
import { getAccessToken } from "@/lib/authToken";
import { ApiError } from "@/lib/api";
import { registerAuthFailureHandler } from "@/auth/authEvents";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
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
  authStatus: AuthStatus;
  rolesStatus: RolesStatus;
  user: AuthenticatedUser | null;
  accessToken: string | null;
  error: string | null;
  authenticated: boolean;
  isAuthenticated: boolean;
  authReady: boolean;
  pendingPhoneNumber: string | null;
  startOtp: (payload: StartOtpPayload) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload | string, code?: string) => Promise<void>;
  login: (token: string) => Promise<void>;
  setAuth: (payload: SetAuthPayload) => void;
  setAuthenticated: () => void;
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export type AuthContextType = AuthContextValue;

const defaultAuthContext: AuthContextValue = {
  authStatus: "unauthenticated",
  rolesStatus: "resolved",
  user: null,
  accessToken: null,
  error: null,
  authenticated: false,
  isAuthenticated: false,
  authReady: false,
  pendingPhoneNumber: null,
  startOtp: async () => undefined,
  verifyOtp: async () => undefined,
  login: async () => undefined,
  setAuth: () => undefined,
  setAuthenticated: () => undefined,
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
  const hasAccessToken = Boolean(getAccessToken());
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() =>
    hasAccessToken ? "authenticated" : "unauthenticated"
  );
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>(() =>
    hasAccessToken ? "loading" : "resolved"
  );
  const [user, setUser] = useState<AuthenticatedUser | null>(() =>
    getStoredUser<AuthenticatedUser>()
  );
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const previousStatus = useRef<AuthStatus | null>(null);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    setAccessTokenState(null);
    setUser(null);
    setAuthStatus("unauthenticated");
    setRolesStatus("resolved");
    setError(null);
  }, []);

  const forceLogout = useCallback(
    async (reason: string) => {
      logAuthInfo("Auth forced logout", user, { reason });
      clearAuthState();
    },
    [clearAuthState, user]
  );

  const setAuth = useCallback(({ user: newUser }: SetAuthPayload) => {
    setUser(newUser ?? null);
    setStoredUser(newUser ?? null);
    const nextAuthStatus = getAccessToken() ? "authenticated" : "unauthenticated";
    setAuthStatus(nextAuthStatus);
    setRolesStatus("resolved");
    setError(null);
  }, []);

  const setAuthenticated = useCallback(() => {
    setAuthStatus("authenticated");
    setRolesStatus((current) => (current === "resolved" ? current : "loading"));
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (!getAccessToken()) {
      setUser(null);
      setAuthStatus("unauthenticated");
      setRolesStatus("resolved");
      return false;
    }
    setAuthStatus("authenticated");
    setRolesStatus("loading");
    try {
      const profile = await fetchCurrentUser();
      setUser(profile.data ?? null);
      setStoredUser(profile.data ?? null);
      setRolesStatus("resolved");
      return Boolean(profile.data);
    } catch (fetchError) {
      if (
        fetchError instanceof ApiError &&
        (fetchError.status === 401 || fetchError.status === 403)
      ) {
        clearStoredAuth();
        setUser(null);
        setAuthStatus("unauthenticated");
        setRolesStatus("resolved");
        setError(null);
        return false;
      }
      logAuthError("/api/auth/me failed", user, { error: fetchError });
      setError("Unable to refresh user profile.");
      setRolesStatus("resolved");
      return false;
    }
  }, [user]);

  const login = useCallback(async (token: string): Promise<void> => {
    setStoredAccessToken(token);
    setAccessTokenState(token);
    setAuthStatus("authenticated");
    setRolesStatus("loading");
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!accessToken) {
        if (!isMounted) return;
        setUser(null);
        setAuthStatus("unauthenticated");
        setRolesStatus("resolved");
        setError(null);
        return;
      }
      setAuthStatus("authenticated");
      setRolesStatus("loading");
      const storedUser = getStoredUser<AuthenticatedUser>();
      if (storedUser) {
        setUser(storedUser);
      }
      try {
        const profile = await fetchCurrentUser();
        if (!isMounted) return;
        if (profile.data) {
          setUser(profile.data ?? null);
          setStoredUser(profile.data ?? null);
        }
        setRolesStatus("resolved");
      } catch (fetchError) {
        if (!isMounted) return;
        if (
          fetchError instanceof ApiError &&
          (fetchError.status === 401 || fetchError.status === 403)
        ) {
          clearStoredAuth();
          setUser(null);
          setAuthStatus("unauthenticated");
          setRolesStatus("resolved");
          setError(null);
          return;
        }
        logAuthError("/api/auth/me failed", null, { error: fetchError });
        setError("Unable to refresh user profile.");
        setRolesStatus("resolved");
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
  }, [accessToken]);

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
    async ({ phone }: StartOtpPayload): Promise<void> => {
      setError(null);
      try {
        logAuthInfo("OTP start request fired", user, { phone });
        const result = await startOtpService({ phone });
        // HTTP 204 is treated as success with no body.
        if (result === null) {
          setPendingPhoneNumber(phone);
          return;
        }
        const headers = result.headers ?? {};
        const headerKey = Object.keys(headers).find((key) => key.toLowerCase() === "x-twilio-sid");
        const twilioSid =
          result.data?.twilioSid ??
          result.data?.sid ??
          (headerKey ? headers[headerKey] : undefined);
        if (!twilioSid) {
          throw new Error("Twilio SID missing from OTP response");
        }
        setPendingPhoneNumber(phone);
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP failed";
        setError(message);
        setAuthStatus("unauthenticated");
        setRolesStatus("resolved");
        throw err;
      }
    },
    [user]
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload | string, codeArg?: string): Promise<void> => {
      setError(null);
      const resolvedPayload =
        typeof payload === "string" ? { phone: payload, code: codeArg ?? "" } : payload;
      const phoneNumber = resolvedPayload.phone ?? pendingPhoneNumber ?? "";

      try {
        logAuthInfo("OTP verify request fired", user, { phone: phoneNumber });
        const response = await verifyOtpService({ phone: phoneNumber, code: resolvedPayload.code });
        if (!response?.accessToken) {
          throw new Error("OTP verification missing access token");
        }
        await login(response.accessToken);
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP verification failed";
        setError(message);
        setAuthStatus("unauthenticated");
        setRolesStatus("resolved");
        throw err;
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

  const isAuthenticated = authStatus === "authenticated";

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      authStatus,
      rolesStatus,
      user,
      accessToken,
      error,
      authenticated: isAuthenticated,
      isAuthenticated,
      authReady: true,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setAuthenticated,
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
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      login,
      setAuth,
      setAuthenticated,
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
