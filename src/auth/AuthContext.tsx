import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, setUnauthorizedHandler } from "@/services/api";
import { login as loginService, LoginSuccess } from "@/services/auth";

type User = {
  id: string;
  email: string;
  role: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginSuccess>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectToLogin = useCallback(() => {
    if (window.location.pathname !== "/login") {
      if (import.meta.env.MODE === "test") {
        window.history.replaceState({}, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
        return;
      }
      window.location.href = "/login";
    }
  }, []);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
    setLoading(false);
    redirectToLogin();
  }, [clearAuthState, redirectToLogin]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthState();
      setLoading(false);
      redirectToLogin();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearAuthState, redirectToLogin]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      clearAuthState();
      setLoading(false);
      redirectToLogin();
      return;
    }

    apiFetch<User>("/api/auth/me")
      .then((data) => setUser(data))
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email: string, password: string) => {
    const { user: userData, accessToken } = await loginService(email, password);
    if (!accessToken) {
      throw new Error("Missing access token");
    }

    localStorage.setItem("accessToken", accessToken);
    setUser(userData);

    setUnauthorizedHandler(() => {
      clearAuthState();
      setLoading(false);
      redirectToLogin();
    });

    return { user: userData, accessToken };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export { AuthContext };
