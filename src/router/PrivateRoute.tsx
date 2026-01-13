import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import type { UserRole } from "@/utils/roles";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { authReady, status } = useAuth();

  if (!authReady) return null;
  if (status === "unauthenticated" || status === "expired") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
