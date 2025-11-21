import { create } from "zustand";

export type Role = "admin" | "staff" | "lender" | "referrer";

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
  role: Role | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  logout: (redirect?: boolean) => void;
  refresh: () => Promise<void>;
};

const AUTH_TOKEN_KEY = "STAFF_AUTH_TOKEN";
const AUTH_USER_KEY = "STAFF_AUTH_USER";

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

export function normalizeUser(user: unknown): AuthUser {
  const candidate = (user ?? {}) as Partial<AuthUser>;
  const role = normalizeRole((candidate as any).role);
  if (!candidate.id || !candidate.email || !role) {
    throw new Error("Invalid user payload");
  }

  return {
    ...candidate,
    id: String(candidate.id),
    email: String(candidate.email),
    role,
  } as AuthUser;
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;

  try {
    return normalizeUser(JSON.parse(stored));
  } catch (error) {
    console.warn("Failed to read stored user", error);
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
      name: user.name,
    })
  );
}

function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export const authStore = create<AuthState>((set, get) => {
  const token = readStoredToken();
  const user = readStoredUser();

  return {
    token,
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(token),

    login: (nextToken, nextUser) => {
      const normalizedUser = normalizeUser(nextUser);
      persistAuth(nextToken, normalizedUser);
      set({
        token: nextToken,
        user: normalizedUser,
        role: normalizedUser.role,
        isAuthenticated: true,
      });
    },

    setUser: (nextUser) => {
      if (!nextUser) {
        set({ user: null, role: null, isAuthenticated: Boolean(get().token) });
        return;
      }
      const normalizedUser = normalizeUser(nextUser);
      const token = get().token;
      if (token) {
        persistAuth(token, normalizedUser);
      }
      set({ user: normalizedUser, role: normalizedUser.role });
    },

    logout: (redirect = true) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
      set({ token: null, user: null, role: null, isAuthenticated: false });
      if (redirect) {
        redirectToLogin();
      }
    },

    refresh: async () => {
      const tokenFromStorage = readStoredToken();
      if (!tokenFromStorage) {
        set({ token: null, user: null, role: null, isAuthenticated: false });
        return;
      }

      set({ token: tokenFromStorage, isAuthenticated: true });

      try {
        const { authClient } = await import("./auth.client");
        const response = await authClient.get("/api/users/me");
        const userPayload = normalizeUser((response.data as any).user ?? response.data);
        persistAuth(tokenFromStorage, userPayload);
        set({
          token: tokenFromStorage,
          user: userPayload,
          role: userPayload.role,
          isAuthenticated: true,
        });
      } catch (error: any) {
        if (error?.response?.status === 401) {
          get().logout();
        } else {
          set({ user: null, role: null });
        }
      }
    },
  };
});

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export { AUTH_TOKEN_KEY, AUTH_USER_KEY, redirectToLogin };
