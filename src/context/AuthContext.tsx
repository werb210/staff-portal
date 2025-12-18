import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { login as loginRequest, type LoginPayload } from "@/api/auth";
import { configureApiClient, type AuthTokens } from "@/api/client";
import { canAccessStaffPortal, type UserRole } from "@/utils/roles";

export type StaffUser = {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
};

export type AuthContextValue = {
  user: StaffUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "staff-portal.user";

const readStoredAuth = (): { tokens: AuthTokens | null; user: StaffUser | null } => {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    return {
      tokens: storedToken ? { token: storedToken } : null,
      user: storedUser ? (JSON.parse(storedUser) as StaffUser) : null
    };
  } catch (error) {
    return { tokens: null, user: null };
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedAuth = readStoredAuth();
  const [tokens, setTokens] = useState<AuthTokens | null>(storedAuth.tokens);
  const [user, setUser] = useState<StaffUser | null>(storedAuth.user);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!storedAuth.tokens?.token && canAccessStaffPortal(storedAuth.user?.role)
  );
  const [isLoading, setIsLoading] = useState(false);

  const persistAuth = useCallback((nextTokens: AuthTokens | null, nextUser: StaffUser | null) => {
    if (!nextTokens || !nextTokens.token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }

    localStorage.setItem(TOKEN_KEY, nextTokens.token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const setAuthState = useCallback(
    (nextTokens: AuthTokens | null, nextUser: StaffUser | null) => {
      setTokens(nextTokens);
      setUser(nextUser);
      setIsAuthenticated(!!nextTokens?.token && canAccessStaffPortal(nextUser?.role));
      persistAuth(nextTokens, nextUser);
    },
    [persistAuth]
  );

  useEffect(() => {
    configureApiClient({
      tokenProvider: () => tokens,
      onTokensUpdated: (nextTokens) => {
        setAuthState(nextTokens, user);
      },
      onUnauthorized: () => {
        setAuthState(null, null);
      }
    });
  }, [setAuthState, tokens, user]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const response = await loginRequest(payload);
        const nextTokens: AuthTokens = { token: response.token };
        const nextUser = response.user as StaffUser;

        setAuthState(nextTokens, nextUser);
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthState]
  );

  const logout = useCallback(() => {
    setAuthState(null, null);
  }, [setAuthState]);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated,
      isLoading,
      login,
      logout
    }),
    [isAuthenticated, isLoading, login, logout, tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
