// server/src/types/User.ts
export type UserRole = "admin" | "staff" | "lender" | "referrer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
}
