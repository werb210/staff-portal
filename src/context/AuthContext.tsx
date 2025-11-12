import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, type AuthUser } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'staff-portal-session';

const readStoredSession = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string };
  } catch (error) {
    console.error('Failed to parse stored auth session', error);
    return null;
  }
};

const writeStoredSession = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
  }
};

const useAuthProvider = (queryClient: QueryClient): AuthContextValue => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setUser(null);
    setToken(null);
    writeStoredSession(null);
    setAuthToken(null);
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const loadUser = useCallback(
    async (sessionToken: string | null) => {
      if (!sessionToken) {
        setLoading(false);
        setUser(null);
        setAuthToken(null);
        return;
      }

      try {
        setAuthToken(sessionToken);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load current user', error);
        await clearSession();
      } finally {
        setLoading(false);
      }
    },
    [clearSession],
  );

  useEffect(() => {
    const stored = readStoredSession();
    const storedToken = stored?.token ?? null;
    setToken(storedToken);
    loadUser(storedToken);
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { token: nextToken, user: loggedInUser } = await loginRequest({ email, password });
        setToken(nextToken);
        setUser(loggedInUser);
        writeStoredSession(nextToken);
        setAuthToken(nextToken);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
    }),
    [loading, login, logout, token, user],
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const value = useAuthProvider(queryClient);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
