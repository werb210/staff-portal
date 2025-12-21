import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import AppLoading from "@/components/layout/AppLoading";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken
} from "@/services/token";
import type { LoginSuccess } from "@/services/auth";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextType = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<LoginSuccess>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const storedToken = getStoredAccessToken();

      if (!storedToken) {
        if (mounted) {
          setUser(null);
          setStatus("unauthenticated");
        }
        return;
      }

      setToken(storedToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

      try {
        const res = await apiClient.get<User>("/auth/me");
        if (mounted) {
          setUser(res.data ?? null);
          setStatus("authenticated");
        }
      } catch {
        if (mounted) {
          setUser(null);
          clearStoredAccessToken();
          setToken(null);
          delete apiClient.defaults.headers.common.Authorization;
          setStatus("unauthenticated");
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<LoginSuccess>("/auth/login", { email, password });

    setStoredAccessToken(res.data.accessToken);
    setToken(res.data.accessToken);
    apiClient.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;

    const me = await apiClient.get<User>("/auth/me");
    setUser(me.data);
    setStatus("authenticated");

    return { user: me.data, accessToken: res.data.accessToken };
  };

  const logout = () => {
    clearStoredAccessToken();
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common.Authorization;
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, token, status, login, logout }}>
      {status === "loading" ? <AppLoading /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export { AuthContext };
