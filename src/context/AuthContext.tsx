import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

export type Role = "admin" | "staff";

type DecodedToken = {
  role?: Role;
};

interface AuthContextType {
  role: Role | null;
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  token: null,
  login: () => {},
  logout: () => {}
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
      const decoded = jwtDecode<DecodedToken>(token);
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

  return <AuthContext.Provider value={{ role, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
