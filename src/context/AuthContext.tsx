import React, { createContext, useContext, useEffect, useState } from "react";
import type { Silo } from "../types/silo";

export interface AuthContextValue {
  status: "loading" | "authenticated:resolved" | "unauthenticated";
  user: any | null;
  role: string | null;
  token: string | null;
  canAccessSilo: (silo: Silo) => boolean;
  allowedSilos: Silo[];
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] =
    useState<AuthContextValue["status"]>("loading");

  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [allowedSilos, setAllowedSilos] = useState<Silo[]>([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const hydrate = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setUser(data);
      setRole(data.role ?? null);
      setAllowedSilos(
        Array.isArray(data.allowedSilos)
          ? data.allowedSilos.filter(
              (s: unknown): s is Silo =>
                typeof s === "string" && ["bf", "bi", "slf", "admin"].includes(s)
            )
          : []
      );
      setStatus("authenticated:resolved");
    } catch {
      setUser(null);
      setRole(null);
      setAllowedSilos([]);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const refresh = async () => {
    setStatus("loading");
    await hydrate();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
    setAllowedSilos([]);
    setStatus("unauthenticated");
  };

  const canAccessSilo = (silo: Silo) => {
    return allowedSilos.includes(silo);
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        role,
        token,
        canAccessSilo,
        allowedSilos,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
