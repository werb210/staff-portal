import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal } from "@/utils/roles";
import Card from "@/components/ui/Card";
import AppLoading from "@/components/layout/AppLoading";

interface PrivateRouteProps {
  allowedRoles?: string[];
  children?: JSX.Element;
}

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoading />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canAccessStaffPortal(user.role)) {
    return (
      <Card title="Access Restricted">
        <p>Your role does not permit access to the Staff Portal.</p>
      </Card>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Card title="Access Restricted">
        <p>Your role does not have access to this area.</p>
      </Card>
    );
  }

  return children ?? <Outlet />;
}
