import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal, type UserRole } from "@/utils/roles";
import Card from "@/components/ui/Card";
import AppLoading from "@/components/layout/AppLoading";

interface PrivateRouteProps {
  allowedRoles?: UserRole[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="route-guard">
        <AppLoading />
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="route-guard">
        <Card title="Access Restricted">
          <p>Your role does not have access to this area of the Staff Portal.</p>
        </Card>
      </div>
    );
  }

  if (user && !canAccessStaffPortal(user.role)) {
    return (
      <div className="route-guard">
        <Card title="Different Portal">
          <p>
            Your account is configured for a different portal. The Staff Portal currently supports ADMIN
            and STAFF roles.
          </p>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
