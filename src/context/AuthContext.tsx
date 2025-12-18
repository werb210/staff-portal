import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { login as loginRequest } from "@/api/auth";
import { configureApiClient } from "@/api/client";
import { canAccessStaffPortal, type UserRole } from "@/utils/roles";

export type StaffUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  requiresOtp?: boolean;
};

export type AuthContextValue = {
  user: StaffUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "staff_portal_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((nextToken: string | null, nextUser: StaffUser | null) => {
    if (nextToken && nextUser) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const setAuthState = useCallback(
    (nextToken: string | null, nextUser: StaffUser | null) => {
      setToken(nextToken);
      setUser(nextUser);
      persistAuth(nextToken, nextUser);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    setAuthState(null, null);
    window.location.href = "/login";
  }, [setAuthState]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setAuthState(storedToken, JSON.parse(storedUser) as StaffUser);
      } catch (error) {
        setAuthState(null, null);
      }
    }

    setIsLoading(false);
  }, [setAuthState]);

  useEffect(() => {
    configureApiClient({
      tokenProvider: () => (token ? { token } : null),
      onTokensUpdated: (nextTokens) => {
        const nextToken = nextTokens?.token ?? null;
        setAuthState(nextToken, nextToken ? user : null);
      },
      onUnauthorized: logout
    });
  }, [logout, setAuthState, token, user]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await loginRequest({ email, password });
        setAuthState(response.token, response.user as StaffUser);
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthState]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user && canAccessStaffPortal(user.role),
      isLoading,
      login,
      logout
    }),
    [isLoading, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
