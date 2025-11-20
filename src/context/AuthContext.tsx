import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface UserProfile {
  name: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string, role?: string, userName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = "auth_token";
const LEGACY_TOKEN_KEY = "bf_token";
const ROLE_KEY = "bf_role";
const AUTH_USER_KEY = "auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    const storedName = localStorage.getItem(AUTH_USER_KEY);
    return storedName ? { name: storedName } : null;
  });

  const login = (newToken: string, role?: string, userName?: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, newToken);

    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    }

    if (userName) {
      localStorage.setItem(AUTH_USER_KEY, userName);
      setUser({ name: userName });
    }

    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
