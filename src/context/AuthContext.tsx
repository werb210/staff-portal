import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextShape {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load stored token on boot
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api.setToken(token);
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    api.setToken(token);

    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => logout());
  };

  const logout = () => {
    localStorage.removeItem("token");
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
