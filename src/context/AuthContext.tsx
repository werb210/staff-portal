import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Role = "admin" | "staff";
export type AppSilo = "bf" | "bi" | "slf";

type DecodedToken = {
  role?: Role;
};

const allowedSilos: Record<Role, AppSilo[]> = {
  admin: ["bf", "bi", "slf"],
  staff: ["bf", "bi"]
};

interface AuthContextType {
  role: Role | null;
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
  canAccessSilo: (silo: AppSilo) => boolean;
  allowedSilos: AppSilo[];
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  token: null,
  login: () => {},
  logout: () => {},
  canAccessSilo: () => false,
  allowedSilos: []
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("portal_token"));
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!token) {
      setRole(null);
      return;
    }

    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload || "")) as DecodedToken;
      setRole(decoded.role ?? null);
    } catch {
      setRole(null);
    }
  }, [token]);

  function login(t: string) {
    localStorage.setItem("portal_token", t);
    setToken(t);
  }

  function logout() {
    localStorage.removeItem("portal_token");
    setToken(null);
    setRole(null);
  }

  const canAccessSilo = (silo: AppSilo) => {
    if (!role) return false;
    return allowedSilos[role].includes(silo);
  };

  const roleAllowedSilos = useMemo(() => (role ? allowedSilos[role] : []), [role]);

  return (
    <AuthContext.Provider value={{ role, token, login, logout, canAccessSilo, allowedSilos: roleAllowedSilos }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
