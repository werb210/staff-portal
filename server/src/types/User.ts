export interface User {
  id: string;
  email: string;
  role: "admin" | "staff" | "lender" | "referrer";
  name: string;
}
