import { create } from "zustand";

export type UserRole = "admin" | "staff" | "marketing" | "lender" | "referrer";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface SessionState {
  user: SessionUser | null;
  token: string | null;
  role: UserRole | null;
  permissions: string[];
  expiresAt: string | null;
  setSession: (payload: {
    user: SessionUser;
    token: string;
    expiresAt?: string;
  }) => void;
  clearSession: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = "staff_portal_session";

const readSession = (): Partial<SessionState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return parsed;
  } catch (err) {
    console.error("Failed to read session", err);
    return {};
  }
};

const writeSession = (state: Partial<SessionState>) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: state.user ?? null,
        token: state.token ?? null,
        role: state.role ?? null,
        permissions: state.permissions ?? [],
        expiresAt: state.expiresAt ?? null,
      })
    );
  } catch (err) {
    console.error("Failed to persist session", err);
  }
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  role: null,
  permissions: [],
  expiresAt: null,
  setSession: ({ user, token, expiresAt }) => {
    set({
      user,
      token,
      role: user.role,
      permissions: user.permissions,
      expiresAt: expiresAt ?? null,
    });
    writeSession({ user, token, role: user.role, permissions: user.permissions, expiresAt });
  },
  clearSession: () => {
    set({ user: null, token: null, role: null, permissions: [], expiresAt: null });
    writeSession({});
  },
  hydrate: () => {
    const snapshot = readSession();
    if (snapshot.token && snapshot.user) {
      set({
        user: snapshot.user ?? null,
        token: snapshot.token ?? null,
        role: snapshot.role ?? snapshot.user?.role ?? null,
        permissions: snapshot.permissions ?? snapshot.user?.permissions ?? [],
        expiresAt: snapshot.expiresAt ?? null,
      });
    }
  },
}));
