import type { UserRole } from "@/utils/roles";
import { hasRequiredRole } from "@/utils/roles";

export type Capability = string;

export const hasCapabilities = (
  userCapabilities: Capability[] | null | undefined,
  requiredCapabilities: Capability[]
) => {
  if (requiredCapabilities.length === 0) return true;
  if (!userCapabilities || userCapabilities.length === 0) return false;
  return requiredCapabilities.every((capability) => userCapabilities.includes(capability));
};

export const canAccess = (params: {
  role?: UserRole | null;
  allowedRoles?: UserRole[];
  requiredCapabilities?: Capability[];
  userCapabilities?: Capability[] | null;
}) => {
  const { role, allowedRoles = [], requiredCapabilities = [], userCapabilities } = params;
  const roleAllowed = allowedRoles.length === 0 || hasRequiredRole(role, allowedRoles);
  const capabilityAllowed = hasCapabilities(userCapabilities, requiredCapabilities);
  return roleAllowed && capabilityAllowed;
};
