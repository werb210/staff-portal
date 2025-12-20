import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AppLoading from "@/components/layout/AppLoading";

type PrivateRouteProps = {
  allowedRoles?: string[];
  children?: JSX.Element;
};

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Access Restricted</div>;
  }

  return children ?? <Outlet />;
}
