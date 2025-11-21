// LEGACY AUTH — DO NOT USE
// Replaced by unified auth system in src/lib/auth/
import { create } from "zustand";
import { pushToast } from "../components/ui/toast";

export type Role = "admin" | "staff" | "lender" | "referrer";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  name?: string;
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
};

export const STAFF_AUTH_TOKEN = "STAFF_AUTH_TOKEN";
export const STAFF_AUTH_USER = "STAFF_AUTH_USER";

let hasLoaded = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    const normalizedUser = {
      ...user,
      role: user.role?.toLowerCase?.() as Role,
    };
    localStorage.setItem(STAFF_AUTH_TOKEN, token);
    localStorage.setItem(STAFF_AUTH_USER, JSON.stringify(normalizedUser));
    set({ token, user: normalizedUser, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STAFF_AUTH_TOKEN);
      localStorage.removeItem(STAFF_AUTH_USER);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    if (hasLoaded || typeof window === "undefined") return;
    hasLoaded = true;

    const token = localStorage.getItem(STAFF_AUTH_TOKEN);
    const storedUser = localStorage.getItem(STAFF_AUTH_USER);
    let parsedUser: AuthUser | null = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser) as AuthUser;
      } catch {
        parsedUser = null;
      }
    }

    if (!token) {
      set({ token: null, user: null, isAuthenticated: false });
      return;
    }

    set({ token, isAuthenticated: true, user: parsedUser });

    try {
      const { default: apiClient } = await import("../lib/apiClient");
      const response = await apiClient.get("/api/users/me");
      const nextUser = (response.data?.user ?? response.data) as AuthUser;
      const normalizedUser = {
        ...nextUser,
        role: nextUser.role?.toLowerCase?.() as Role,
      };
      localStorage.setItem(STAFF_AUTH_USER, JSON.stringify(normalizedUser));
      set({ user: normalizedUser, isAuthenticated: true, token });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        pushToast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
        get().logout();
      } else {
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },
}));
