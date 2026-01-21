import { useEffect, useRef } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import AppLoading from "@/components/layout/AppLoading";
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
  const { user, isLoading, status } = useAuth();
  const hasAccess = hasRequiredRole(user?.role, roles);
  const emittedRef = useRef(false);
  const isRolePending = status === "authenticated" && user?.role === undefined;

  useEffect(() => {
    if (!isLoading && !isRolePending && !hasAccess && !emittedRef.current) {
      emitUiTelemetry("permission_blocked", { requiredRoles: roles });
      emittedRef.current = true;
    }
  }, [hasAccess, isLoading, isRolePending, roles]);

  if (isLoading || isRolePending) {
    return <AppLoading />;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AccessRestricted message={message} requiredRoles={roles} />;
  }

  return <>{children}</>;
};

export default RequireRole;
