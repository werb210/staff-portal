import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, type UserRole } from "@/lib/auth/useAuthStore";

interface ProtectedRouteProps {
  allow?: UserRole[];
  children?: JSX.Element;
}

export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { token, user, loading, initialized } = useAuthStore((state) => ({
    token: state.token,
    user: state.user,
    loading: state.loading,
    initialized: state.initialized,
  }));
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
