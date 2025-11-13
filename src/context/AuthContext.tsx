// ======================================================================
// src/context/AuthContext.tsx
// Canonical Staff App Auth Context
// - Single source of truth for token + profile
// - Syncs with localStorage
// - Supports ProtectedRoute and useAuth
// - No infinite loops, no double-loads
// ======================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
} from "../api/auth";

import { setAuthToken, setUnauthorizedHandler } from "../api/client";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ----------------------------------------------------------------------
// Storage key
// ----------------------------------------------------------------------
const STORAGE_KEY = "staff-portal-session";

// Read token from storage
const readStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token ?? null;
  } catch {
    return null;
  }
};

// Write token to storage
const writeStoredToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
  }
};

// ======================================================================
// Provider logic
// ======================================================================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Internal: fully clear session
  // -----------------------------------------------------------
  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    writeStoredToken(null);
    setAuthToken(null);
  }, []);

  // -----------------------------------------------------------
  // Load user from API when token exists
  // -----------------------------------------------------------
  const loadProfile = useCallback(
    async (sessionToken: string | null) => {
      if (!sessionToken) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        setAuthToken(sessionToken);
        const profile = await getCurrentUser();
        setUser(profile);
      } catch (e) {
        console.warn("Auth failed, clearing session", e);
        clearSession();
      } finally {
        setLoading(false);
      }
    },
    [clearSession]
  );

  // -----------------------------------------------------------
  // Restore token on boot
  // -----------------------------------------------------------
  useEffect(() => {
    const stored = readStoredToken();
    setToken(stored);
    void loadProfile(stored);
  }, [loadProfile]);

  // -----------------------------------------------------------
  // Login
  // -----------------------------------------------------------
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token: nextToken, user: profile } = await loginRequest({
        email,
        password,
      });

      setToken(nextToken);
      setUser(profile);
      writeStoredToken(nextToken);
      setAuthToken(nextToken);
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------------
  // Logout
  // -----------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Remote logout is optional
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // -----------------------------------------------------------
  // Global 401 Handler → auto logout
  // -----------------------------------------------------------
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  // -----------------------------------------------------------
  // Memoized context value
  // -----------------------------------------------------------
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
    }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ======================================================================
// Hook
// ======================================================================
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
};
