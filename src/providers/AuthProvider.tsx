import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "../services";

type AuthContextType = {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Load existing auth session
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    AuthAPI.me()
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("auth_token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email: string, password: string) {
    const res = await AuthAPI.login({ email, password });
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("auth_token", res.data.token);
    const me = await AuthAPI.me();
    setUser(me.data);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
