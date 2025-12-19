import { useEffect, useState } from "react";
import apiClient from "@/api/client";
import { useAuth as useAuthContext } from "@/auth/AuthContext";

type StaffUser = {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  requiresOtp?: boolean;
};

type AuthTokens = {
  token?: string;
};

export type AuthValue = {
  user: StaffUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const useAuth = (): AuthValue => {
  const { authenticated, loading, login, logout } = useAuthContext();
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authenticated) {
        setUser(null);
        return;
      }

      try {
        const res = await apiClient.get("/auth/me");
        setUser(res.data ?? null);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [authenticated]);

  const handleLogin: AuthValue["login"] = async ({ email, password }) => {
    await login(email, password);
    try {
      const res = await apiClient.get("/auth/me");
      setUser(res.data ?? null);
    } catch {
      setUser(null);
    }
  };

  return {
    user,
    tokens: null,
    isAuthenticated: authenticated,
    isLoading: loading,
    login: handleLogin,
    logout
  };
};
