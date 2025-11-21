import { create } from "zustand";

export type Role = "admin" | "staff" | "lender" | "referrer";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const AUTH_USER_KEY = "AUTH_USER";

function normalizeRole(role?: string | null): Role | null {
  if (!role) return null;
  const normalized = role.toLowerCase();
  if (
    normalized === "admin" ||
    normalized === "staff" ||
    normalized === "lender" ||
    normalized === "referrer"
  ) {
    return normalized;
  }
  return null;
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as AuthUser;
    const role = normalizeRole(parsed?.role);
    if (!role) return null;
    return { ...parsed, role };
  } catch {
    return null;
  }
}

function persistAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  );
}

let storageListenerAttached = false;

export const authStore = create<AuthState>((set, _get) => {
  const syncFromStorage = () => {
    const token = readToken();
    const user = readUser();
    set({ token, user, isAuthenticated: Boolean(token) });
  };

  if (typeof window !== "undefined" && !storageListenerAttached) {
    window.addEventListener("storage", (event) => {
      if (event.key === AUTH_TOKEN_KEY || event.key === AUTH_USER_KEY || event.key === null) {
        syncFromStorage();
      }
    });
    storageListenerAttached = true;
  }

  const initialToken = readToken();
  const initialUser = readUser();

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: Boolean(initialToken),

    login: (token, user) => {
      const role = normalizeRole(user?.role);
      if (!role) {
        throw new Error("Invalid user role");
      }
      const normalizedUser: AuthUser = { ...user, role };
      persistAuth(token, normalizedUser);
      set({ token, user: normalizedUser, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
      set({ token: null, user: null, isAuthenticated: false });
    },

    refresh: async () => {
      const token = readToken();
      if (!token) {
        set({ token: null, user: null, isAuthenticated: false });
        return;
      }

      const cachedUser = readUser();
      set({ token, user: cachedUser, isAuthenticated: true });

      const { fetchMe } = await import("./me");
      try {
        await fetchMe();
      } catch (error) {
        console.error("Failed to refresh session", error);
      }
    },
  };
});

export function getStoredAuth() {
  return { token: readToken(), user: readUser() };
}

export { AUTH_TOKEN_KEY, AUTH_USER_KEY };
