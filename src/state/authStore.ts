import { create } from "zustand";
import { getAuthToken, setAuthToken, clearAuthToken } from "../utils/authToken";
import axios from "axios";

export type Role = "admin" | "staff" | "marketing" | "lender" | "referrer";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  restore: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getAuthToken(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
      });

      const res = await api.post("/api/auth/login", { email, password });

      const token = res.data.token;
      const user = res.data.user;

      setAuthToken(token);

      set({
        token,
        user,
        loading: false,
      });

      return true;
    } catch (err: any) {
      set({
        error: err?.message ?? "Login failed",
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    clearAuthToken();
    set({
      token: null,
      user: null,
      error: null,
    });
  },

  restore: async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await api.get("/api/auth/me");

      set({
        token,
        user: res.data.user,
      });
    } catch {
      clearAuthToken();
      set({ token: null, user: null });
    }
  },
}));
