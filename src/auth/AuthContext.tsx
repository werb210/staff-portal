import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

const resolveStoredAuth = (): { token: string | null; user: AuthenticatedUser | null } => {
  try {
    return {
      token: getStoredAccessToken(),
      user: getStoredUser<AuthenticatedUser>()
    };
  } catch (error) {
    console.error("Failed to read stored auth", error);
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);

  const setAuth = useCallback(({ token: newToken, user: newUser }: SetAuthPayload) => {
    const resolvedUser = newUser ?? decodeJwtPayload(newToken);
    setToken(newToken);
    setUser(resolvedUser ?? null);
    setStatus("authenticated");
    setError(null);

    try {
      setStoredAccessToken(newToken);
    } catch (storageError) {
      console.error("Failed to persist access token", storageError);
    }

    if (resolvedUser) {
      try {
        setStoredUser(resolvedUser);
      } catch (storageError) {
        console.error("Failed to persist user", storageError);
      }
    }
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

      const decoded = decodeJwtPayload(storedToken);
      if (decoded) {
        setToken(storedToken);
        setUser(decoded);
        setStatus("authenticated");
        try {
          setStoredAccessToken(storedToken);
          setStoredUser(decoded);
        } catch (storageError) {
          console.error("Failed to update stored auth", storageError);
        }
        return true;
      }

      try {
        clearStoredAuth();
      } catch (storageError) {
        console.error("Failed to clear stored auth", storageError);
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
        const resolvedUser = storedUser ?? decodeJwtPayload(storedToken);
        setToken(storedToken);
        setUser(resolvedUser ?? null);
        setStatus("authenticated");
        if (resolvedUser) {
          try {
            setStoredUser(resolvedUser);
          } catch (storageError) {
            console.error("Failed to persist decoded user", storageError);
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

  const startOtp = useCallback(async ({ phone }: StartOtpPayload): Promise<void> => {
    setError(null);
    try {
      const result = await startOtpService({ phone });
      if (result === null) {
        // HTTP 204 is treated as success with no body.
      }
      setPendingPhoneNumber(phone);
    } catch (err: any) {
      const message = (err?.message as string) ?? "OTP failed";
      setError(message);
      setStatus("unauthenticated");
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload | string, codeArg?: string): Promise<void> => {
      setError(null);
      const resolvedPayload =
        typeof payload === "string" ? { phone: payload, code: codeArg ?? "" } : payload;
      const phoneNumber = resolvedPayload.phone ?? pendingPhoneNumber ?? "";

      try {
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
              console.error("Failed to persist refresh token", storageError);
            }
          }

          if (result.token) {
            setAuth({ token: result.token, user: result.user ?? null });
          } else {
            setAuthenticated();
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
    [pendingPhoneNumber, refreshUser, setAuth, setAuthenticated]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout failed", error);
    }
    try {
      clearStoredAuth();
    } catch (storageError) {
      console.error("Failed to clear stored auth", storageError);
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
