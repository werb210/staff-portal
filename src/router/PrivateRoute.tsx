import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal } from "@/utils/roles";
import AppLoading from "@/components/layout/AppLoading";
import Card from "@/components/ui/Card";

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoading />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
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

  return <Outlet />;
}
