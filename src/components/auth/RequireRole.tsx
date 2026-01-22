import { useEffect, useRef } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import AccessRestricted from "@/components/auth/AccessRestricted";
import AppLoading from "@/components/layout/AppLoading";
import { useAuth } from "@/hooks/useAuth";
import { emitUiTelemetry } from "@/utils/uiTelemetry";
import { hasRequiredRole, type UserRole } from "@/utils/roles";

const defaultMessage = "You do not have permission to view this page.";

type RequireRoleProps = PropsWithChildren<{
  roles: UserRole[];
  fallback?: ReactNode;
  message?: string;
}>;

const RequireRole = ({ roles, children, fallback, message = defaultMessage }: RequireRoleProps) => {
  const { user, authStatus } = useAuth();
  const hasAccess = hasRequiredRole(user?.role, roles);
  const emittedRef = useRef(false);

  useEffect(() => {
    if (!hasAccess && authStatus === "authenticated" && !emittedRef.current) {
      emitUiTelemetry("permission_blocked", { requiredRoles: roles });
      emittedRef.current = true;
    }
  }, [authStatus, hasAccess, roles]);

  if (authStatus === "loading") {
    return <AppLoading />;
  }

  if (authStatus === "authenticated" && !hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AccessRestricted message={message} requiredRoles={roles} />;
  }

  return <>{children}</>;
};

export default RequireRole;
