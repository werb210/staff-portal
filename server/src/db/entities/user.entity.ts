export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "staff" | "lender" | "referrer";
  createdAt: Date;
  updatedAt: Date;
}

