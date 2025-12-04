export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "lender" | "referrer";
}
