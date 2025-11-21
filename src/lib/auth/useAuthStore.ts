import { create } from "zustand";
import { AuthAPI } from "@/services/auth";

export const TOKEN_STORAGE_KEY = "staff_portal_token";

export type UserRole = "admin" | "staff" | "marketing" | "lender" | "referrer";

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role: UserRole;
  permissions?: string[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  user: null,
  loading: false,
  initialized: false,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user });
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await AuthAPI.login({ email, password });
      const token = res.data?.token ?? res.data?.accessToken ?? "";

      if (!token) {
        throw new Error("Missing access token from auth response");
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token);

      const me = await AuthAPI.me();
      const user = me.data?.user ?? me.data;

      set({ token, user, loading: false, initialized: true });
    } catch (error) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      set({ token: null, user: null, loading: false, initialized: true });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null });
  },

  initialize: async () => {
    if (get().initialized) return;

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      set({ initialized: true, loading: false, token: null, user: null });
      return;
    }

    set({ loading: true });
    try {
      const me = await AuthAPI.me();
      const user = me.data?.user ?? me.data;
      set({ token, user, initialized: true, loading: false });
    } catch (error) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      set({ token: null, user: null, initialized: true, loading: false });
    }
  },
}));
