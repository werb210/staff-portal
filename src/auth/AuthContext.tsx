import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";

type AuthContextType = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        await apiClient.get("/auth/me");
        setAuthenticated(true);
      } catch {
        localStorage.removeItem("auth_token");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });

    if (!res.data?.token) {
      throw new Error("Invalid credentials");
    }

    localStorage.setItem("auth_token", res.data.token);
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
