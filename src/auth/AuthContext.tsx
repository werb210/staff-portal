import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/api/client";
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

export type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginSuccess>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());

  useEffect(() => {
    let mounted = true;
    const storedToken = getStoredAccessToken();

    if (storedToken) {
      setToken(storedToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    }

    apiClient
      .get("/api/auth/me")
      .then((res) => {
        if (mounted) setUser(res.data ?? null);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });

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

    return { user: me.data, accessToken: res.data.accessToken };
  };

  const logout = () => {
    clearStoredAccessToken();
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: !ready, login, logout }}>
      {ready && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export { AuthContext };
