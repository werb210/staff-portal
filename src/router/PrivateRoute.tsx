import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { getStoredAccessToken, getStoredUser } from "@/services/token";
import type { UserRole } from "@/utils/roles";
import type { AuthenticatedUser } from "@/services/auth";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { authReady, user } = useAuth();
  const storedToken = getStoredAccessToken();
  const storedUser = getStoredUser<AuthenticatedUser>();

  if (!authReady) return null;

  if (!storedToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = user?.role ?? storedUser?.role;
    if (role && !allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
