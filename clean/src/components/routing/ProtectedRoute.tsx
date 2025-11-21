import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "../../lib/auth/authStore";
import { Role } from "../../lib/auth/authStore";

type ProtectedRouteProps = {
  roles?: Role[];
  children: ReactNode;
};

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = authStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
