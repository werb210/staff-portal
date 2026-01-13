import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import type { UserRole } from "@/utils/roles";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, authReady } = useAuth();

  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
