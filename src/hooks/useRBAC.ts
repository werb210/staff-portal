import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { isModuleEnabled } from '../config/rbac';
import type { PortalModule, PortalPermission } from '../types/rbac';

export function useRBAC() {
  const { user } = useAuthStore();

  const canAccess = useMemo(
    () =>
      (module: PortalModule, required?: PortalPermission | PortalPermission[]) => {
        if (!user) return false;
        const requirements = Array.isArray(required) ? required : required ? [required] : [];
        if (requirements.length > 0) {
          return requirements.every((perm) => user.permissions.includes(perm));
        }
        return isModuleEnabled(user.silo, module, user.permissions);
      },
    [user]
  );

  const hasPermission = useMemo(
    () => (permission: PortalPermission) => user?.permissions.includes(permission) ?? false,
    [user]
  );

  return { user, canAccess, hasPermission };
}
