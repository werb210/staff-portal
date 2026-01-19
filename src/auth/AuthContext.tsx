import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  startOtp as startOtpService,
  verifyOtp as verifyOtpService,
  logout as logoutService,
} from "@/services/auth";
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth.store";

type AuthContextValue = {
  isAuthenticated: boolean;
  status: "idle" | "sending" | "code_required" | "verifying" | "authenticated" | "error";
  error: string | null;
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { phone: string; code: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(getAccessToken())
  );
  const [status, setStatus] = useState<AuthContextValue["status"]>(() =>
    getAccessToken() ? "authenticated" : "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasToken = Boolean(getAccessToken());
    setIsAuthenticated(hasToken);
    setStatus(hasToken ? "authenticated" : "idle");
  }, []);

  const startOtp = useCallback(async (payload: { phone: string }) => {
    setStatus("sending");
    setError(null);
    try {
      await startOtpService(payload);
      setStatus("code_required");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send code.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(
    async (payload: { phone: string; code: string }) => {
      setStatus("verifying");
      setError(null);
      try {
        const res = await verifyOtpService(payload);
        if (!res?.accessToken) {
          throw new Error("Missing access token.");
        }
        setAccessToken(res.accessToken);
        setIsAuthenticated(true);
        setStatus("authenticated");
        return res as unknown;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Verification failed.";
        setError(message);
        setIsAuthenticated(false);
        setStatus("error");
        throw err;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutService();
    clearAccessToken();
    setIsAuthenticated(false);
    setStatus("idle");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      status,
      error,
      startOtp,
      verifyOtp,
      logout,
    }),
    [isAuthenticated, status, error, startOtp, verifyOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
