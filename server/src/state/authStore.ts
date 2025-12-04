import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/apiClient";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      async login(email, password) {
        try {
          const res = await api.post("/auth/login", { email, password });
          set({
            user: res.data.user,
            token: res.data.token,
            isAuthenticated: true
          });
          return true;
        } catch {
          return false;
        }
      },

      logout() {
        set({ user: null, token: null, isAuthenticated: false });
      },

      async init() {
        const token = get().token;
        if (!token) return;
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    { name: "staff-auth" }
  )
);
