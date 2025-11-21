import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserSession {
  id: string;
  email: string;
  role: "admin" | "staff" | "lender" | "referrer";
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
  login: (token: string, user: UserSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => {
        set({ token, user });
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: "bf-staff-auth", // localStorage key
    }
  )
);
