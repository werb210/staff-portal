import { create } from 'zustand';
import type { AuthSession } from '../types/auth';
import type { StaffUser } from '../types/rbac';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  user: StaffUser | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  setUser: (user: StaffUser) => void;
  setStatus: (status: AuthStatus) => void;
  setToken: (token: string | null) => void;
  clear: () => void;
}

type StoredSession = {
  token: string | null;
  user: StaffUser | null;
};

const SESSION_STORAGE_KEY = 'bf_staff_portal_session';

const isBrowser = typeof window !== 'undefined';

function readStoredSession(): StoredSession | null {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored auth session', error);
    return null;
  }
}

function persistSession(partial: Partial<StoredSession>) {
  if (!isBrowser) return;
  const current = readStoredSession() ?? { token: null, user: null };
  const next = { ...current, ...partial } satisfies StoredSession;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
}

function clearStoredSession() {
  if (!isBrowser) return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  token: null,
  hydrated: false,
  hydrate: () => {
    const stored = readStoredSession();
    if (!stored) {
      set({ hydrated: true, status: 'unauthenticated', user: null, token: null });
      return;
    }
    set({
      hydrated: true,
      token: stored.token ?? null,
      user: stored.user ?? null,
      status: stored.token ? 'loading' : 'unauthenticated',
    });
  },
  setSession: (session) => {
    persistSession({ token: session.token, user: session.user });
    set({ token: session.token, user: session.user, status: 'authenticated', hydrated: true });
  },
  setUser: (user) => {
    persistSession({ user });
    set({ user });
  },
  setStatus: (status) => set({ status }),
  setToken: (token) => {
    persistSession({ token });
    set({ token });
  },
  clear: () => {
    clearStoredSession();
    set({ token: null, user: null, status: 'unauthenticated', hydrated: true });
  },
}));
