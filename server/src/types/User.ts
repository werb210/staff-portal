export type UserRole =
  | "admin"
  | "staff"
  | "marketing"
  | "lender"
  | "referrer"
  | "superadmin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
}
