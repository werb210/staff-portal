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

const normalizeUserRole = (role?: string | null): UserRole | undefined => {
  if (!role) return undefined;
  return role.toUpperCase() as UserRole;
};

const normalizeUser = (user: StaffUser | null): StaffUser | null =>
  user
    ? {
        ...user,
        role: normalizeUserRole(user.role) ?? (user.role as UserRole)
      }
    : null;

const readStoredAuth = (): { tokens: AuthTokens | null; user: StaffUser | null } => {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    return {
      tokens: storedToken ? { token: storedToken } : null,
      user: storedUser ? normalizeUser(JSON.parse(storedUser) as StaffUser) : null
    };
  } catch (error) {
    return { tokens: null, user: null };
  }
};

const persistAuth = (tokens: AuthTokens | null, user: StaffUser | null) => {
  if (!tokens || !tokens.token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return;
  }

  localStorage.setItem(TOKEN_KEY, tokens.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => readStoredAuth().tokens);
  const [user, setUser] = useState<StaffUser | null>(() => readStoredAuth().user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    configureApiClient({
      tokenProvider: () => tokens,
      onTokensUpdated: (nextTokens) => {
        setTokens(nextTokens);
        persistAuth(nextTokens, user);
      },
      onUnauthorized: () => {
        setTokens(null);
        setUser(null);
        persistAuth(null, null);
      }
    });
  }, [tokens, user]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await loginRequest(payload);
      const nextTokens: AuthTokens = { token: response.token };
      const normalizedUser = normalizeUser(response.user as StaffUser);

      setTokens(nextTokens);
      setUser(normalizedUser);
      persistAuth(nextTokens, normalizedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    persistAuth(null, null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: !!tokens?.token && canAccessStaffPortal(user?.role),
      isLoading,
      login,
      logout
    }),
    [isLoading, login, logout, tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
