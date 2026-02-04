import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { canAccess, type Capability } from "@/utils/permissions";
import { resolveUserRole, type UserRole } from "@/utils/roles";

export function RequireRole({
  allow,
  capabilities = [],
  children
}: {
  allow: UserRole[];
  capabilities?: Capability[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const hasAccess = canAccess({
    role: resolveUserRole((user as { role?: string | null } | null)?.role ?? null),
    allowedRoles: allow,
    requiredCapabilities: capabilities,
    userCapabilities: (user as { capabilities?: Capability[] } | null)?.capabilities ?? null
  });
  if (!user || !hasAccess) {
    return <div role="alert">Access denied</div>;
  }
  return <>{children}</>;
}
