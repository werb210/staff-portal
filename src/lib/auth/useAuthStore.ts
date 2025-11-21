import { create } from "zustand";

export const TOKEN_STORAGE_KEY = "staff_portal_token";
export const ROLE_STORAGE_KEY = "staff_portal_role";
export const EMAIL_STORAGE_KEY = "staff_portal_email";

export type UserRole = "Admin" | "Staff" | "Lender" | "Referrer" | string;

export interface AuthUser {
  email?: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;

  setAuth: (token: string, role: UserRole, email?: string) => void;
  logout: () => void;
}

const getInitialState = (): Pick<AuthState, "token" | "user"> => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const role = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
  const email = localStorage.getItem(EMAIL_STORAGE_KEY) || undefined;

  if (!token || !role) return { token: null, user: null };

  return {
    token,
    user: { role, email },
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setAuth: (token, role, email) =>
    set(() => {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(ROLE_STORAGE_KEY, role);
      if (email) {
        localStorage.setItem(EMAIL_STORAGE_KEY, email);
      }

      return {
        token,
        user: { role, email },
      };
    }),

  logout: () =>
    set(() => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      localStorage.removeItem(EMAIL_STORAGE_KEY);

      return {
        token: null,
        user: null,
      };
    }),
}));
