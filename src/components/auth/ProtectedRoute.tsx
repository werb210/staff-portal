import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

type ProtectedRouteProps = {
  role?: string;
};

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userRole = useAuthStore((state) => state.role);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);
  const fetchSession = useAuthStore((state) => state.fetchSession);

  useEffect(() => {
    if (!initialized) {
      void initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && token && !user && !loading) {
      void fetchSession();
    }
  }, [initialized, token, user, loading, fetchSession]);

  if (!initialized || loading) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole && role !== userRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
