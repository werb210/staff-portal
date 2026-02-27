import React, { createContext, useContext, useEffect, useState } from "react";
import type { Silo } from "../types/silo";

export interface AuthContextValue {
  status: "loading" | "authenticated:resolved" | "unauthenticated";
  user: any | null;
  role: string | null;
  token: string | null;
  allowedSilos: Silo[];
  canAccessSilo: (s: Silo) => boolean;
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
      setAllowedSilos(data.allowedSilos ?? []);
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

  const canAccessSilo = (s: Silo) => allowedSilos.includes(s);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        role,
        token,
        allowedSilos,
        canAccessSilo,
        logout,
        refresh,
      }}
    >
      <span data-testid="status">{status}</span>
      <span data-testid="location">{window.location.pathname}</span>
      {role && <span data-testid="role">{role}</span>}
      {status === "authenticated:resolved" && (
        <button onClick={logout}>Logout</button>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
