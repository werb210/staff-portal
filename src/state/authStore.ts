// src/state/authStore.ts
// GLOBAL AUTH STORE — TOKEN + USER + LOGIN/LOGOUT

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: any | null;

  login: (token: string, user?: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) =>
        set({
          token,
          user: user || null,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
        }),
    }),
    {
      name: "bf_staff_auth",
    }
  )
);

