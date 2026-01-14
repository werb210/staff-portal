export const roleValues = ["Admin", "Staff", "Lender", "Referrer"] as const;

export type UserRole = (typeof roleValues)[number];

export const fullStaffRoles: UserRole[] = ["Admin", "Staff"];

export const canAccessMarketing = (role?: UserRole | null) => role === "Admin";
export const canAccessStaffPortal = (role?: UserRole | null) =>
  role != null && fullStaffRoles.includes(role);

export const canAccessLenderPortal = (role?: UserRole | null) => role === "Lender";
export const canAccessReferrerPortal = (role?: UserRole | null) => role === "Referrer";

export const hasRequiredRole = (role: UserRole | null | undefined, requiredRoles: UserRole[]) =>
  Boolean(role && requiredRoles.includes(role));

export const assertKnownRole = (role: string): asserts role is UserRole => {
  if (!roleValues.includes(role as UserRole)) {
    throw new Error(`Unknown role: ${role}`);
  }
};

export const getRoleLabel = (role?: UserRole | null) => {
  switch (role) {
    case "Admin":
      return "Admin";
    case "Staff":
      return "Staff";
    case "Lender":
      return "Lender";
    case "Referrer":
      return "Referrer";
    default:
      return "Unknown";
  }
};
