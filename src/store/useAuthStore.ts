import axios from "axios";
import { create } from "zustand";
import api from "@/lib/api/client";

export type UserRole = "admin" | "staff" | "marketing" | "lender" | "referrer" | "user" | null;

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole | string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadSession: () => Promise<void>;
}

const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  role: (localStorage.getItem(ROLE_KEY) as UserRole) ?? null,
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

  login: async (email: string, password: string) => {
    const response = await api.post("/api/users/login", { email, password });
    const { token, user, role } = response.data ?? {};

    if (!token) {
      throw new Error("Missing token in login response");
    }

    localStorage.setItem(TOKEN_KEY, token);
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    set({
      token,
      user: user ?? null,
      role: (role as UserRole) ?? (user?.role as UserRole) ?? null,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    delete axios.defaults.headers.common["Authorization"];
    set({ token: null, user: null, role: null, isAuthenticated: false });
  },

  loadSession: async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      set({ token: null, user: null, role: null, isAuthenticated: false });
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

    try {
      const response = await api.get("/api/users/me");
      const me = response.data?.user ?? response.data;
      const role = (me?.role as UserRole) ?? ((localStorage.getItem(ROLE_KEY) as UserRole) ?? null);

      set({ token: storedToken, user: me ?? null, role, isAuthenticated: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        set({ token: null, user: null, role: null, isAuthenticated: false });
      }
      throw error;
    }
  },
}));
