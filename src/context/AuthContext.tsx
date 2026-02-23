import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Role = "admin" | "staff";
export type AppSilo = "bf" | "bi" | "slf";

type DecodedToken = {
  role?: Role;
  exp?: number;
  allowedSilos?: AppSilo[];
};

function decodePortalToken(token: string): DecodedToken | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload || "")) as DecodedToken;
  } catch {
    return null;
  }
}

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
  const [tokenAllowedSilos, setTokenAllowedSilos] = useState<AppSilo[]>([]);

  useEffect(() => {
    if (!token) {
      setRole(null);
      return;
    }

    const decoded = decodePortalToken(token);
    if (!decoded) {
      logout();
      return;
    }

    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      logout();
      return;
    }

    if (!decoded.role) {
      logout();
      return;
    }

    setRole(decoded.role);
    setTokenAllowedSilos(decoded.allowedSilos?.length ? decoded.allowedSilos : allowedSilos[decoded.role]);
  }, [token]);

  function login(t: string) {
    localStorage.setItem("portal_token", t);
    setToken(t);
  }

  function logout() {
    localStorage.removeItem("portal_token");
    setToken(null);
    setRole(null);
    setTokenAllowedSilos([]);
  }

  const canAccessSilo = (silo: AppSilo) => {
    return tokenAllowedSilos.includes(silo);
  };

  const roleAllowedSilos = useMemo(() => tokenAllowedSilos, [tokenAllowedSilos]);

  return (
    <AuthContext.Provider value={{ role, token, login, logout, canAccessSilo, allowedSilos: roleAllowedSilos }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
