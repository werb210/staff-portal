import { useState } from "react";
import { api } from "../lib/api";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return {
    login,
    logout,
    loading,
    error,
  };
}
