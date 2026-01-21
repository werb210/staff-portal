import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AccessRestricted from "@/components/auth/AccessRestricted";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";
import { hasRequiredRole, type UserRole } from "@/utils/roles";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({ children, allowedRoles = [] }: PrivateRouteProps) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();
  const isRolePending = auth.status === "authenticated" && auth.user?.role === undefined;

  if (auth.status === "loading" || isRolePending) {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: isRolePending ? "roles_loading" : "auth_loading"
    });
    return null;
  }

  if (auth.status === "unauthenticated") {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: "unauthenticated_redirect"
    });
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRequiredRole(auth.user?.role, allowedRoles)) {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: "role_restricted"
    });
    return <AccessRestricted requiredRoles={allowedRoles} />;
  }

  console.info("Route guard decision", {
    requestId,
    route: location.pathname,
    authState: auth.status,
    reason: "authenticated"
  });
  return children;
}
