import { create } from "zustand";
import { login as apiLogin, fetchMe, logout as apiLogout } from "@/api/auth";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: true,

  init: async () => {
    const token = get().token;
    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const res = await fetchMe();
      set({ user: res.user, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem("token", res.token);
    set({ token: res.token, user: res.user });
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem("token");
    set({ user: null, token: null });
  }
}));
