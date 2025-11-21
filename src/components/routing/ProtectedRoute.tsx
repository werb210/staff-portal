import { ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, Role } from "@/store/authStore";

interface ProtectedRouteProps {
  roles?: Role[];
  children?: ReactNode;
}

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadFromStorage();
      if (active) setCheckingSession(false);
    })();
    return () => {
      active = false;
    };
  }, [loadFromStorage]);

  if (checkingSession) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const normalizedRole = user?.role?.toLowerCase?.() as Role | undefined;

  if (roles && (!normalizedRole || !roles.includes(normalizedRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
