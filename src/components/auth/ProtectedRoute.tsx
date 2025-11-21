// legacy – not consumed by active auth system
import { ReactNode, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Role, useAuthStore } from "@/store/auth";

type ProtectedRouteProps = {
  roles?: Exclude<Role, null>[];
  children?: ReactNode;
};

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
