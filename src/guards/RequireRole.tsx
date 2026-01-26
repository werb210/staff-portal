import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { canAccess, type Capability } from "@/utils/permissions";
import type { UserRole } from "@/utils/roles";

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
    role: user?.role ?? null,
    allowedRoles: allow,
    requiredCapabilities: capabilities,
    userCapabilities: (user as { capabilities?: Capability[] } | null)?.capabilities ?? null
  });
  if (!user || !hasAccess) {
    return <div role="alert">Access denied</div>;
  }
  return <>{children}</>;
}
