import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AccessRestricted from "@/components/auth/AccessRestricted";
import AppLoading from "@/components/layout/AppLoading";
import RouteSkeleton from "@/components/layout/RouteSkeleton";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";
import { type UserRole } from "@/utils/roles";
import { canAccess, type Capability } from "@/utils/permissions";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
  requiredCapabilities?: Capability[];
};

export default function PrivateRoute({
  children,
  allowedRoles = [],
  requiredCapabilities = []
}: PrivateRouteProps) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  if (!auth.authReady || auth.authStatus === "loading" || auth.rolesStatus === "loading") {
    return <RouteSkeleton label="Loading secure content" />;
  }

  if (auth.authStatus === "authenticated" && !auth.user) {
    return <AppLoading />;
  }

  if (auth.authStatus === "unauthenticated") {
    if (import.meta.env.DEV) {
      console.info("Route guard decision", {
        requestId,
        route: location.pathname,
        authState: auth.authStatus,
        reason: "unauthenticated_redirect"
      });
    }

    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  if (
    auth.authStatus === "authenticated" &&
    !canAccess({
      role: (auth.user?.role ?? null) as
        | "Admin"
        | "Staff"
        | "Marketing"
        | "Viewer"
        | "Lender"
        | "Referrer"
        | null,
      allowedRoles,
      requiredCapabilities,
      userCapabilities: (auth.user as { capabilities?: Capability[] } | null)?.capabilities ?? null
    })
  ) {
    if (import.meta.env.DEV) {
      console.info("Route guard decision", {
        requestId,
        route: location.pathname,
        authState: auth.authStatus,
        reason: "role_restricted"
      });
    }

    return <AccessRestricted requiredRoles={allowedRoles} />;
  }

  if (import.meta.env.DEV) {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.authStatus,
      reason: "authenticated"
    });
  }

  return children;
}
