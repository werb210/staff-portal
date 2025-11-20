import { useState } from "react";
import { api } from "../lib/api";
import { clearAuth, setToken, setUserRole } from "../lib/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await api.post("/api/auth/login", { email, password });
      setToken(data.token);
      if (data.role) {
        setUserRole(data.role);
      }
      // Default to staff if API does not return a role to keep navigation usable
      if (!data.role) {
        setUserRole("staff");
      }
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return {
    login,
    logout,
    loading,
    error,
  };
}
