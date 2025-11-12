import type { Silo, StaffUser } from './rbac';

export interface AuthSession {
  token: string;
  user: StaffUser;
}

export interface ReturningApplication {
  id: string;
  businessName: string;
  stage?: string;
  status?: string;
  updatedAt?: string;
}

export interface AuthResponse extends AuthSession {
  expiresAt?: string;
  returningApplications?: ReturningApplication[];
}

export interface LoginPayload {
  email: string;
  password: string;
  silo: Silo;
  remember?: boolean;
  applicationId?: string;
}

export interface PasskeyPayload {
  credential: string;
  silo: Silo;
  applicationId?: string;
}
