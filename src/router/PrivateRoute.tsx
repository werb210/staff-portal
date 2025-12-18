import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal } from "@/utils/roles";
import Card from "@/components/ui/Card";

interface PrivateRouteProps {
  allowedRoles?: string[];
  children?: JSX.Element;
}

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
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

  return children ?? <Outlet />;
}
