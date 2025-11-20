import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  login: (token: string, role?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = "auth_token";
const LEGACY_TOKEN_KEY = "bf_token";
const ROLE_KEY = "bf_role";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  });

  const login = (newToken: string, role?: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, newToken);

    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    }

    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
