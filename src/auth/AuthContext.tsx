import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/api/client";
import { login as loginService, type AuthenticatedUser, type LoginSuccess } from "@/services/auth";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken
} from "@/services/token";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { redirectToLogin } from "@/services/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextType = {
  user: AuthenticatedUser | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<LoginSuccess>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storedToken = getStoredAccessToken();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(() => storedToken);
  const [status, setStatus] = useState<AuthStatus>(storedToken ? "loading" : "unauthenticated");

  useEffect(() => {
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await apiClient.get<AuthenticatedUser>("/auth/me");
        setUser(profile);
        setStatus("authenticated");
      } catch (error) {
        console.error("Auth bootstrap failed", error);
        clearStoredAccessToken();
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    return registerAuthFailureHandler(() => {
      clearStoredAccessToken();
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
      redirectToLogin();
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginService(email, password);
    setStoredAccessToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    setStatus("authenticated");
    return result;
  }, []);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
    redirectToLogin();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, status, login, logout }),
    [login, logout, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
