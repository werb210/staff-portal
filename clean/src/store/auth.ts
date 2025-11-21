// LEGACY AUTH — DO NOT USE
// Replaced by unified auth system in src/lib/auth/
import { create } from "zustand";
import { AuthAPI } from "../services/auth";
import { TOKEN_STORAGE_KEY, setUnauthorizedHandler } from "../lib/http";

export type Role = "admin" | "staff" | "lender" | "referrer" | null;

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  name?: string;
  [key: string]: unknown;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  role: Role;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<Role>;
  fetchSession: () => Promise<void>;
  logout: () => void;
};

function readStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => {
  const handleUnauthorized = () => {
    get().logout();
  };

  setUnauthorizedHandler(handleUnauthorized);

  return {
    token: readStoredToken(),
    user: null,
    role: null,
    loading: false,
    initialized: false,

    async initialize() {
      if (get().initialized) return;

      set({ loading: true, initialized: true });
      try {
        const storedToken = readStoredToken();
        if (storedToken) {
          set({ token: storedToken });
          await get().fetchSession();
        } else {
          set({ token: null, user: null, role: null });
        }
      } finally {
        set({ loading: false });
      }
    },

    async login(email, password) {
      set({ loading: true });
      try {
        const { token } = await AuthAPI.login({ email, password });
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        set({ token });
        await get().fetchSession();
        return get().role;
      } finally {
        set({ loading: false });
      }
    },

    async fetchSession() {
      const token = readStoredToken();
      if (!token) {
        set({ token: null, user: null, role: null });
        return;
      }

      try {
        const response = await AuthAPI.me();
        const user = (response as any).user ?? response;
        const role = (response as any).role ?? user?.role ?? null;
        const normalizedRole =
          typeof role === "string" ? (role.toLowerCase() as Exclude<Role, null>) : role;
        set({ user: user ?? null, role: normalizedRole ?? null });
      } catch (error: any) {
        if (error?.response?.status === 401) {
          get().logout();
        } else {
          throw error;
        }
      }
    },

    logout() {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      set({ token: null, user: null, role: null, initialized: true, loading: false });
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    },
  };
});
