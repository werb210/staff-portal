// server/src/state/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/User";
import { setAuthToken } from "@/lib/http";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (payload: { user: User; token: string }) => void;
  clearAuth: () => void;
  setLoading: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      setAuth: ({ user, token }) => {
        set({ user, token });
        setAuthToken(token);
      },
      clearAuth: () => {
        set({ user: null, token: null });
        setAuthToken(null);
      },
      setLoading: (value: boolean) => set({ loading: value }),
    }),
    {
      name: "staff-portal-auth",
      onRehydrateStorage: () => (state) => {
        const token = state?.token ?? null;
        setAuthToken(token);
      },
    }
  )
);
