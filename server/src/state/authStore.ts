import { create } from "zustand";
import { AuthAPI } from "@/api/auth";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  login: async (email, password) => {
    const res = await AuthAPI.login(email, password);
    set({ token: res.token, user: res.user });
  },

  fetchMe: async () => {
    try {
      const res = await AuthAPI.me();
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await AuthAPI.logout();
    set({ user: null, token: null });
  },
}));
