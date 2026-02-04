import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { canAccess, type Capability } from "@/utils/permissions";
import { resolveUserRole, type UserRole } from "@/utils/roles";

export const useAuthorization = (params: {
  roles?: UserRole[];
  capabilities?: Capability[];
}) => {
  const { user } = useAuth();

  return useMemo(
    () =>
      canAccess({
        role: resolveUserRole((user as { role?: string | null } | null)?.role ?? null),
        allowedRoles: params.roles ?? [],
        requiredCapabilities: params.capabilities ?? [],
        userCapabilities: (user as { capabilities?: Capability[] } | null)?.capabilities ?? null
      }),
    [params.capabilities, params.roles, user]
  );
};
