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
import { clearStoredAuth, setStoredAccessToken, setStoredUser } from "@/services/token";
import { getAccessToken } from "@/lib/authToken";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { redirectToLogin } from "@/services/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

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
  status: AuthStatus;
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
  status: "loading",
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
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const previousStatus = useRef<AuthStatus | null>(null);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  const forceLogout = useCallback(
    async (reason: string) => {
      logAuthInfo("Auth forced logout", user, { reason });
      clearAuthState();
      redirectToLogin();
    },
    [clearAuthState, user]
  );

  const setAuth = useCallback(
    ({ user: newUser }: SetAuthPayload) => {
      if (newUser && !getAccessToken()) {
        void forceLogout("missing-token");
        return;
      }
      setUser(newUser ?? null);
      setStoredUser(newUser ?? null);
      setStatus(newUser ? "authenticated" : "unauthenticated");
      setError(null);
    },
    [forceLogout]
  );

  const setAuthenticated = useCallback(() => {
    setStatus("authenticated");
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (!getAccessToken()) {
      await forceLogout("missing-token");
      return false;
    }
    try {
      const profile = await fetchCurrentUser();
      setUser(profile.data ?? null);
      setStoredUser(profile.data ?? null);
      setStatus(profile.data ? "authenticated" : "unauthenticated");
      return Boolean(profile.data);
    } catch (fetchError) {
      logAuthError("/api/auth/me failed", user, { error: fetchError });
      await forceLogout("auth-me-failed");
      setUiFailure({
        message: "Authentication failed while validating credentials.",
        details: `Request ID: ${getRequestId()}`,
        timestamp: Date.now()
      });
      return false;
    }
  }, [forceLogout, user]);

  const login = useCallback(
    async (token: string): Promise<void> => {
      setStoredAccessToken(token);
      setAccessToken(token);
      setStatus("loading");
      try {
        const profile = await fetchCurrentUser();
        setUser(profile.data ?? null);
        setStoredUser(profile.data ?? null);
        setStatus(profile.data ? "authenticated" : "unauthenticated");
        if (!profile.data) {
          await forceLogout("missing-user-profile");
        }
      } catch (fetchError) {
        logAuthError("/api/auth/me failed after login", user, { error: fetchError });
        await forceLogout("auth-me-failed");
      }
    },
    [forceLogout, user]
  );

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        if (!isMounted) return;
        await forceLogout("missing-token");
        return;
      }
      setAccessToken(token);
      try {
        const profile = await fetchCurrentUser();
        if (!isMounted) return;
        setUser(profile.data ?? null);
        setStoredUser(profile.data ?? null);
        setStatus(profile.data ? "authenticated" : "unauthenticated");
        if (!profile.data) {
          await forceLogout("missing-user-profile");
        }
      } catch (fetchError) {
        if (!isMounted) return;
        await forceLogout("auth-me-failed");
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuthState, forceLogout]);

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
      previousStatus.current = status;
      return;
    }

    const prior = previousStatus.current;
    if (prior !== status) {
      if (prior === "unauthenticated" && status === "authenticated") {
        logAuthInfo("Auth transition unauthenticated → authenticated", user);
      }
      if (prior === "authenticated" && status === "unauthenticated") {
        logAuthInfo("Auth transition authenticated → unauthenticated", user);
      }
    }
    previousStatus.current = status;
  }, [status, user]);

  const startOtp = useCallback(
    async ({ phone }: StartOtpPayload): Promise<void> => {
      setError(null);
      try {
        logAuthInfo("OTP start request fired", user, { phone });
        const result = await startOtpService({ phone });
        if (result === null) {
          // HTTP 204 is treated as success with no body.
          setPendingPhoneNumber(phone);
          return;
        }
        const twilioSid =
          (result as { data?: { twilioSid?: string; sid?: string } } | null)?.data?.twilioSid ??
          (result as { data?: { twilioSid?: string; sid?: string } } | null)?.data?.sid ??
          (result as { headers?: Record<string, string> } | null)?.headers?.["x-twilio-sid"] ??
          (result as { headers?: Record<string, string> } | null)?.headers?.[
            "x-twilio-message-sid"
          ] ??
          null;
        if (!twilioSid) {
          logAuthError("OTP start missing Twilio SID", user, { phone });
          throw new Error("OTP start missing Twilio SID");
        }
        logAuthInfo("OTP start confirmed Twilio SID", user, { twilioSid });
        setPendingPhoneNumber(phone);
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP failed";
        setError(message);
        setStatus("unauthenticated");
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
        setStatus("unauthenticated");
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
    redirectToLogin();
  }, [clearAuthState, user]);

  const isAuthenticated = status === "authenticated";

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      error,
      authenticated: isAuthenticated,
      isAuthenticated,
      authReady: status !== "loading",
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
      status,
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
