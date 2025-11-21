import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  children?: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    let mounted = true;

    const ensureSession = async () => {
      try {
        await loadSession();
      } catch (error) {
        console.error("Session load failed", error);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    ensureSession();

    return () => {
      mounted = false;
    };
  }, [loadSession]);

  if (checking) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
