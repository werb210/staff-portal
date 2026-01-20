import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren
} from "react";
import { useNavigate } from "react-router-dom";

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

export type AuthStatus =
  | "idle"
  | "sending"
  | "code_required"
  | "verifying"
  | "authenticated"
  | "unauthenticated"
  | "expired";

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
  user: AuthenticatedUser | null;
  token: string | null;
  authenticated: boolean;
  authReady: boolean;
  status: AuthStatus;
  error: string | null;
  pendingPhoneNumber: string | null;
  startOtp: (payload: StartOtpPayload) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload | string, code?: string) => Promise<void>;
  setAuth: (payload: SetAuthPayload) => void;
  setAuthenticated: () => void;
  refreshUser: (accessToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwtPayload(jwt: string): any | null {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [authenticated, setAuthenticatedState] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);

  const setAuth = useCallback(
    ({ token: newToken, user: newUser }: SetAuthPayload) => {
      setStoredAccessToken(newToken);
      setToken(newToken);
      const resolvedUser = newUser ?? (decodeJwtPayload(newToken) as AuthenticatedUser | null);
      if (resolvedUser) {
        setStoredUser(resolvedUser);
      }
      setUser(resolvedUser ?? null);
      setAuthenticatedState(true);
      setStatus("authenticated");
      console.log("AUTH STATE UPDATE", {
        token: newToken,
        user: resolvedUser ?? null,
        isAuthenticated: true
      });
    },
    []
  );

  const setAuthenticatedFn = useCallback(() => {
    setAuthenticatedState(true);
    setStatus("authenticated");
  }, []);

  const refreshUser = useCallback(
    async (accessToken?: string): Promise<boolean> => {
      const storedToken = accessToken ?? getStoredAccessToken();
      if (!storedToken) {
        setAuthReady(true);
        return false;
      }
      const payload = decodeJwtPayload(storedToken);
      if (payload) {
        setToken(storedToken);
        setUser(payload as AuthenticatedUser);
        setStoredAccessToken(storedToken);
        setStoredUser(payload);
        setAuthenticatedState(true);
        setStatus("authenticated");
        setAuthReady(true);
        return true;
      }
      clearStoredAuth();
      setToken(null);
      setUser(null);
      setAuthenticatedState(false);
      setStatus("unauthenticated");
      setAuthReady(true);
      return false;
    },
    []
  );

  useEffect(() => {
    (async () => {
      const storedToken = getStoredAccessToken();
      const storedUser = getStoredUser<AuthenticatedUser>();
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(storedUser);
        } else {
          const decoded = decodeJwtPayload(storedToken) as AuthenticatedUser | null;
          setUser(decoded ?? null);
        }
        setAuthenticatedState(true);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
      setAuthReady(true);
    })();
  }, []);

  const startOtp = useCallback(
    async ({ phone }: StartOtpPayload): Promise<void> => {
      setError(null);
      setStatus("sending");
      try {
        await startOtpService({ phone });
        setPendingPhoneNumber(phone);
        setStatus("code_required");
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP failed";
        setError(message);
        setStatus("unauthenticated");
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload | string, codeArg?: string): Promise<void> => {
      setError(null);
      setStatus("verifying");
      const resolvedPayload =
        typeof payload === "string" ? { phone: payload, code: codeArg ?? "" } : payload;
      const phoneNumber = resolvedPayload.phone ?? pendingPhoneNumber ?? "";
      try {
        const result = await verifyOtpService({ phone: phoneNumber, code: resolvedPayload.code });
        console.log("VERIFY RESPONSE", result);
        if (result) {
          const refreshToken =
            (result as { refreshToken?: string; refresh_token?: string }).refreshToken ??
            (result as { refreshToken?: string; refresh_token?: string }).refresh_token ??
            null;
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
          const { token: newToken, user: newUser } = result;
          setAuth({ token: newToken, user: newUser ?? null });
          navigate("/dashboard");
        } else {
          const persisted = getStoredAccessToken();
          if (persisted) {
            const decoded = decodeJwtPayload(persisted) as AuthenticatedUser | null;
            setToken(persisted);
            setUser(decoded ?? null);
            setAuthenticatedState(true);
            setStatus("authenticated");
            console.log("AUTH STATE UPDATE", {
              token: persisted,
              user: decoded ?? null,
              isAuthenticated: true
            });
            navigate("/dashboard");
          } else {
            setStatus("unauthenticated");
          }
        }
      } catch (err: any) {
        const message = (err?.message as string) ?? "OTP verification failed";
        setError(message);
        setStatus("code_required");
      } finally {
        setPendingPhoneNumber(null);
      }
    },
    [navigate, pendingPhoneNumber, setAuth]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutService();
    } catch {}
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setAuthenticatedState(false);
    setStatus("unauthenticated");
    setAuthReady(true);
  }, []);

  const contextValue: AuthContextValue = {
    user,
    token,
    authenticated,
    authReady,
    status,
    error,
    pendingPhoneNumber,
    startOtp,
    verifyOtp,
    setAuth,
    setAuthenticated: setAuthenticatedFn,
    refreshUser,
    logout
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
