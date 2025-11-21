import { useState } from "react";
import api from "../lib/api/client";
import { useAuthStore } from "../lib/auth/useAuthStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logoutStore = useAuthStore((s) => s.logout);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setAuth(data.token, data.role, data.email);
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    logoutStore();
    window.location.href = "/login";
  }

  return {
    login,
    logout,
    loading,
    error,
  };
}
