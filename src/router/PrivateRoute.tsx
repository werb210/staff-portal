import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AccessRestricted from "@/components/auth/AccessRestricted";
import AppLoading from "@/components/layout/AppLoading";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";
import { hasRequiredRole, type UserRole } from "@/utils/roles";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({
  children,
  allowedRoles = [],
}: PrivateRouteProps) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  if (auth.authStatus === "loading") {
    return <AppLoading />;
  }

  // Hard block unauthenticated users
  if (auth.authStatus === "unauthenticated") {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.authStatus,
      reason: "unauthenticated_redirect",
    });

    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  // Role restriction check
  if (
    auth.authStatus === "authenticated" &&
    allowedRoles.length > 0 &&
    !hasRequiredRole(auth.user?.role, allowedRoles)
  ) {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.authStatus,
      reason: "role_restricted",
    });

    return <AccessRestricted requiredRoles={allowedRoles} />;
  }

  console.info("Route guard decision", {
    requestId,
    route: location.pathname,
    authState: auth.authStatus,
    reason: "authenticated",
  });

  return children;
}
