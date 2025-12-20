import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type PrivateRouteProps = {
  allowedRoles?: string[];
  children?: JSX.Element;
};

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Access Restricted</div>;
  }

  return children ?? <Outlet />;
}
