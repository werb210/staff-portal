import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

type PrivateRouteProps = {
  allowedRoles?: string[];
  children?: JSX.Element;
};

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { user, status } = useAuth();

  if (status === "loading") return null;
  if (status === "unauthenticated" || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Access Restricted</div>;
  }

  return children ?? <Outlet />;
}
