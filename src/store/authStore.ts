import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/api/client";

export type Role = "admin" | "staff" | "lender" | "referrer";

interface AuthState {
  token: string | null;
  role: Role | null;
  email: string | null;
  user: any | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      email: null,
      user: null,

      async login(email, password) {
        try {
          const res = await api.post("/api/auth/login", {
            email,
            password
          });

          const { token, role, user } = res.data;

          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({ token, role, email: user.email, user });
          return true;
        } catch (err) {
          return false;
        }
      },

      async hydrate() {
        const token = get().token;
        if (!token) return;

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          const res = await api.get("/api/auth/me");
          set({ user: res.data });
        } catch {
          set({ token: null, role: null, email: null, user: null });
        }
      },

      logout() {
        set({ token: null, role: null, email: null, user: null });
        delete api.defaults.headers.common["Authorization"];
      }
    }),
    {
      name: "staff_portal_auth"
    }
  )
);
