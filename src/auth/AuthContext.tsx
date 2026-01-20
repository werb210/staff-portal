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
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredUser
} from "@/services/token";
import { assertToken, type TokenPayload } from "@/utils/assertToken";
import { getRequestId } from "@/utils/requestId";
import { fetchCurrentUser } from "@/api/auth";
import { setUiFailure } from "@/utils/uiFailureStore";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface SetAuthPayload {
  token: string;
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
  token: string | null;
  error: string | null;
  authenticated: boolean;
  authReady: boolean;
  pendingPhoneNumber: string | null;
  startOtp: (payload: StartOtpPayload) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload | string, code?: string) => Promise<void>;
  setAuth: (payload: SetAuthPayload) => void;
  setAuthenticated: () => void;
  refreshUser: (accessToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export type AuthContextType = AuthContextValue;

const defaultAuthContext: AuthContextValue = {
  status: "loading",
  user: null,
  token: null,
  error: null,
  authenticated: false,
  authReady: false,
  pendingPhoneNumber: null,
  startOtp: async () => undefined,
  verifyOtp: async () => undefined,
  setAuth: () => undefined,
  setAuthenticated: () => undefined,
  refreshUser: async () => false,
  logout: async () => undefined
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwtPayload(jwt: string): AuthenticatedUser | null {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as AuthenticatedUser;
  } catch {
    return null;
  }
}

const formatTokenExpiry = (payload?: { exp?: number } | null) => {
  if (!payload?.exp) return null;
  return new Date(payload.exp * 1000).toISOString();
};

const buildAuthLogContext = (payload?: TokenPayload | null, user?: AuthenticatedUser | null) => ({
  requestId: getRequestId(),
  userId: (user as { id?: string } | null)?.id ?? payload?.sub ?? null,
  role: (user as { role?: string } | null)?.role ?? payload?.role ?? null,
  tokenExpiry: formatTokenExpiry(payload)
});

const logAuthInfo = (
  message: string,
  payload?: TokenPayload | null,
  user?: AuthenticatedUser | null,
  extra?: Record<string, unknown>
) => {
  console.info(message, { ...buildAuthLogContext(payload, user), ...extra });
};

const logAuthError = (
  message: string,
  payload?: TokenPayload | null,
  user?: AuthenticatedUser | null,
  extra?: Record<string, unknown>
) => {
  console.error(message, { ...buildAuthLogContext(payload, user), ...extra });
};

const resolveStoredAuth = (): { token: string | null; user: AuthenticatedUser | null } => {
  try {
    return {
      token: getStoredAccessToken(),
      user: getStoredUser<AuthenticatedUser>()
    };
  } catch (error) {
    logAuthError("Failed to read stored auth", null, null, { error });
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const previousStatus = useRef<AuthStatus | null>(null);

  const setAuth = useCallback(({ token: newToken, user: newUser }: SetAuthPayload) => {
    let tokenPayload: TokenPayload | null = null;
    try {
      tokenPayload = assertToken(newToken);
    } catch (tokenError) {
      const message =
        tokenError instanceof Error && tokenError.message.toLowerCase().includes("role")
          ? "Role missing or invalid"
          : "Token validation failed";
      logAuthError(message, null, newUser, { error: tokenError });
      throw tokenError;
    }
    const resolvedUser = newUser ?? decodeJwtPayload(newToken);
    setToken(newToken);
    setUser(resolvedUser ?? null);
    setStatus("authenticated");
    setError(null);

    try {
      setStoredAccessToken(newToken);
      logAuthInfo("Token stored", tokenPayload, resolvedUser, {
        storage: "auth.store",
        mechanism: "localStorage"
      });
    } catch (storageError) {
      logAuthError("Failed to persist access token", tokenPayload, resolvedUser, {
        error: storageError
      });
    }

    if (resolvedUser) {
      try {
        setStoredUser(resolvedUser);
        logAuthInfo("User stored", tokenPayload, resolvedUser, {
          storage: "localStorage",
          key: "user"
        });
      } catch (storageError) {
        logAuthError("Failed to persist user", tokenPayload, resolvedUser, { error: storageError });
      }
    }

    logAuthInfo("Token received", tokenPayload, resolvedUser);
  }, []);

  const setAuthenticated = useCallback(() => {
    setStatus("authenticated");
    setError(null);
  }, []);

  const refreshUser = useCallback(
    async (accessToken?: string): Promise<boolean> => {
      let storedToken = accessToken ?? null;
      if (!storedToken) {
        storedToken = resolveStoredAuth().token;
      }

      if (!storedToken) {
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
        return false;
      }

      let payload: TokenPayload | null = null;
      try {
        payload = assertToken(storedToken);
      } catch (tokenError) {
        const message =
          tokenError instanceof Error && tokenError.message.toLowerCase().includes("role")
            ? "Role missing or invalid"
            : "Stored token invalid";
        logAuthError(message, null, null, { error: tokenError });
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
        return false;
      }

      try {
        const profile = await fetchCurrentUser();
        setToken(storedToken);
        setUser(profile ?? null);
        setStatus("authenticated");
        try {
          setStoredAccessToken(storedToken);
          setStoredUser(profile ?? payload);
        } catch (storageError) {
          logAuthError("Failed to update stored auth", payload, profile ?? null, {
            error: storageError
          });
        }
        return true;
      } catch (fetchError) {
        logAuthError("Token exists but /auth/me failed", payload, null, { error: fetchError });
        try {
          clearStoredAuth();
        } catch (storageError) {
          logAuthError("Failed to clear stored auth", payload, null, { error: storageError });
        }
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
        setUiFailure({
          message: "Authentication failed while validating the session.",
          details: `Request ID: ${getRequestId()}`,
          timestamp: Date.now()
        });
        throw fetchError;
      }

      try {
        clearStoredAuth();
      } catch (storageError) {
        logAuthError("Failed to clear stored auth", payload, null, { error: storageError });
      }
      setToken(null);
      setUser(null);
      setStatus("unauthenticated");
      return false;
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = () => {
      setStatus("loading");
      const { token: storedToken, user: storedUser } = resolveStoredAuth();
      if (!isMounted) return;

      if (storedToken) {
        try {
          assertToken(storedToken);
        } catch (tokenError) {
          const message =
            tokenError instanceof Error && tokenError.message.toLowerCase().includes("role")
              ? "Role missing or invalid"
              : "Stored token invalid";
          logAuthError(message, null, storedUser ?? null, { error: tokenError });
          setToken(null);
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        const resolvedUser = storedUser ?? decodeJwtPayload(storedToken);
        setToken(storedToken);
        setUser(resolvedUser ?? null);
        setStatus("authenticated");
        if (resolvedUser) {
          try {
            setStoredUser(resolvedUser);
          } catch (storageError) {
            logAuthError("Failed to persist decoded user", null, resolvedUser, {
              error: storageError
            });
          }
        }
      } else {
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!previousStatus.current) {
      previousStatus.current = status;
      return;
    }

    const prior = previousStatus.current;
    if (prior !== status) {
      let payload: TokenPayload | null = null;
      if (token) {
        try {
          payload = assertToken(token);
        } catch (tokenError) {
          logAuthError("Role missing or invalid", null, user, { error: tokenError });
        }
      }
      if (prior === "unauthenticated" && status === "authenticated") {
        logAuthInfo("Auth transition unauthenticated → authenticated", payload, user);
      }
      if (prior === "authenticated" && status === "unauthenticated") {
        logAuthInfo("Auth transition authenticated → unauthenticated", payload, user);
      }
    }
    previousStatus.current = status;
  }, [status, token, user]);

  const startOtp = useCallback(async ({ phone }: StartOtpPayload): Promise<void> => {
    setError(null);
    try {
      logAuthInfo("OTP start request fired", null, user, { phone });
      const result = await startOtpService({ phone });
      if (result === null) {
        // HTTP 204 is treated as success with no body.
      }
      const twilioSid =
        (result as { data?: { twilioSid?: string; sid?: string } } | null)?.data?.twilioSid ??
        (result as { data?: { twilioSid?: string; sid?: string } } | null)?.data?.sid ??
        (result as { headers?: Record<string, string> } | null)?.headers?.["x-twilio-sid"] ??
        (result as { headers?: Record<string, string> } | null)?.headers?.["x-twilio-message-sid"] ??
        null;
      if (!twilioSid) {
        logAuthError("OTP start missing Twilio SID", null, user, { phone });
        throw new Error("OTP start missing Twilio SID");
      }
      logAuthInfo("OTP start confirmed Twilio SID", null, user, { twilioSid });
      setPendingPhoneNumber(phone);
    } catch (err: any) {
      const message = (err?.message as string) ?? "OTP failed";
      setError(message);
      setStatus("unauthenticated");
      throw err;
    }
  }, [user]);

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload | string, codeArg?: string): Promise<void> => {
      setError(null);
      const resolvedPayload =
        typeof payload === "string" ? { phone: payload, code: codeArg ?? "" } : payload;
      const phoneNumber = resolvedPayload.phone ?? pendingPhoneNumber ?? "";

      try {
        logAuthInfo("OTP verify request fired", null, user, { phone: phoneNumber });
        const result = await verifyOtpService({ phone: phoneNumber, code: resolvedPayload.code });
        if (result) {
          const refreshToken =
            (result as { refreshToken?: string; refresh_token?: string }).refreshToken ??
            (result as { refreshToken?: string; refresh_token?: string }).refresh_token ??
            null;
          if (refreshToken) {
            try {
              localStorage.setItem("refresh_token", refreshToken);
            } catch (storageError) {
              logAuthError("Failed to persist refresh token", null, user, { error: storageError });
            }
          }

          if (result.token) {
            try {
              assertToken(result.token);
            } catch (tokenError) {
              const message =
                tokenError instanceof Error && tokenError.message.toLowerCase().includes("role")
                  ? "Role missing or invalid"
                  : "Token validation failed";
              logAuthError(message, null, result.user ?? null, { error: tokenError });
              throw tokenError;
            }
            setAuth({ token: result.token, user: result.user ?? null });
          } else {
            logAuthError("OTP verify returned success but token missing", null, result.user ?? null, {
              phone: phoneNumber
            });
            throw new Error("OTP verify succeeded but token missing");
          }
        } else {
          const refreshed = await refreshUser();
          if (!refreshed) {
            setAuthenticated();
          }
        }
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP verification failed";
        setError(message);
        setStatus("unauthenticated");
        throw err;
      } finally {
        setPendingPhoneNumber(null);
      }
    },
    [pendingPhoneNumber, refreshUser, setAuth, setAuthenticated, user]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutService();
    } catch (error) {
      logAuthError("Logout failed", null, user, { error });
    }
    try {
      clearStoredAuth();
    } catch (storageError) {
      logAuthError("Failed to clear stored auth", null, user, { error: storageError });
    }
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      error,
      authenticated: status === "authenticated",
      authReady: status !== "loading",
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
      setAuth,
      setAuthenticated,
      refreshUser,
      logout
    }),
    [
      status,
      user,
      token,
      error,
      pendingPhoneNumber,
      startOtp,
      verifyOtp,
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
