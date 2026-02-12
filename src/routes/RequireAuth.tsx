import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AppLoading from "@/components/layout/AppLoading";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";
import { resolveUserRole, type UserRole } from "@/utils/roles";

type RequireAuthProps = {
  children: JSX.Element;
  roles?: UserRole[];
};

const DEFAULT_ALLOWED_ROLES: UserRole[] = ["Admin", "Staff", "Lender", "Referrer"];

export default function RequireAuth({ children, roles = DEFAULT_ALLOWED_ROLES }: RequireAuthProps) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  if (auth.authStatus === "loading" || auth.rolesStatus === "loading") {
    return <AppLoading />;
  }

  if (auth.authStatus === "authenticated" && !auth.user) {
    return <AppLoading />;
  }

  if (auth.authStatus === "unauthenticated") {
    if (import.meta.env.DEV) {
      console.info("RequireAuth redirect", {
        requestId,
        route: location.pathname,
        authState: auth.authStatus,
        reason: "unauthenticated_redirect"
      });
    }
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  const userRole = resolveUserRole((auth.user as { role?: string | null } | null)?.role ?? null);
  if (!userRole || !roles.includes(userRole)) {
    if (import.meta.env.DEV) {
      console.info("RequireAuth redirect", {
        requestId,
        route: location.pathname,
        authState: auth.authStatus,
        reason: "role_restricted"
      });
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
