import { useEffect, useRef } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import AccessRestricted from "@/components/auth/AccessRestricted";
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
  const { user, authStatus, rolesStatus } = useAuth();
  const hasAccess = hasRequiredRole(user?.role, roles);
  const emittedRef = useRef(false);

  useEffect(() => {
    if (
      rolesStatus === "resolved" &&
      !hasAccess &&
      authStatus === "authenticated" &&
      !emittedRef.current
    ) {
      emitUiTelemetry("permission_blocked", { requiredRoles: roles });
      emittedRef.current = true;
    }
  }, [authStatus, hasAccess, roles, rolesStatus]);

  if (authStatus === "authenticated" && rolesStatus === "loading") {
    return <>{children}</>;
  }

  if (authStatus === "authenticated" && rolesStatus === "resolved" && !hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AccessRestricted message={message} requiredRoles={roles} />;
  }

  return <>{children}</>;
};

export default RequireRole;
