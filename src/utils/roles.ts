export type UserRole = "ADMIN" | "STAFF" | "LENDER" | "REFERRER";

export const fullStaffRoles: UserRole[] = ["ADMIN", "STAFF"];

export const canAccessMarketing = (role?: UserRole | null) => role === "ADMIN";
export const canAccessStaffPortal = (role?: UserRole | null) =>
  role != null && fullStaffRoles.includes(role);

export const canAccessLenderPortal = (role?: UserRole | null) => role === "LENDER";
export const canAccessReferrerPortal = (role?: UserRole | null) => role === "REFERRER";

export const hasRequiredRole = (role: UserRole | null | undefined, requiredRoles: UserRole[]) =>
  Boolean(role && requiredRoles.includes(role));

export const getRoleLabel = (role?: UserRole | null) => {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "STAFF":
      return "Staff";
    case "LENDER":
      return "Lender";
    case "REFERRER":
      return "Referrer";
    default:
      return "Unknown";
  }
};
