import { useEffect } from "react";
import { useAuthStore } from "@/state/authStore";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, token, loading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (loading) return null;

  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
}
