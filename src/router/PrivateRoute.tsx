import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import type { UserRole } from "@/utils/roles";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { authReady, status, user, token, refreshUser } = useAuth();

  useEffect(() => {
    if (!authReady) return;
    if (status === "authenticated" || !token || user) return;
    void refreshUser(token);
  }, [authReady, refreshUser, status, token, user]);

  if (!authReady) return null;
  if (status === "unauthenticated" || status === "expired") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
