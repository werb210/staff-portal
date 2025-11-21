import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isReady: false,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isReady: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isReady: true,
        }),
    }),
    {
      name: "staff_portal_auth",
    }
  )
);
