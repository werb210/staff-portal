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
  startOtp: (payload: { phone: string }) => Promise<void>;
  verifyOtp: (payload: { phone: string; code: string }) => Promise<void>;
  setAuthenticated: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(getAccessToken())
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(getAccessToken()));
  }, []);

  const startOtp = useCallback(async (payload: { phone: string }) => {
    await startOtpService(payload);
  }, []);

  const verifyOtp = useCallback(
    async (payload: { phone: string; code: string }) => {
      const res = await verifyOtpService(payload);
      // token may be set by interceptor or cookie; mark authenticated explicitly
      setIsAuthenticated(true);
      return res as unknown;
    },
    []
  );

  const setAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    clearAccessToken();
    setIsAuthenticated(false);
    window.location.href = "/login";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      startOtp,
      verifyOtp,
      setAuthenticated,
      logout,
    }),
    [isAuthenticated, startOtp, verifyOtp, setAuthenticated, logout]
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
