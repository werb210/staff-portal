import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { configureApiClient, type AuthTokens, type UserProfile } from "@/api/client";
import { fetchCurrentUser, login as loginRequest, type LoginPayload } from "@/api/auth";
import { canAccessStaffPortal } from "@/utils/roles";

export type AuthContextValue = {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "staff-portal.user";

const readStoredAuth = (): { tokens: AuthTokens | null; user: UserProfile | null } => {
  try {
    const rawToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    const parsedUser = rawUser ? (JSON.parse(rawUser) as UserProfile) : null;

    if (!rawToken) return { tokens: null, user: parsedUser };
    return { tokens: { token: rawToken }, user: parsedUser };
  } catch (error) {
    return { tokens: null, user: null };
  }
};

const persistAuth = (tokens: AuthTokens | null, user: UserProfile | null) => {
  if (!tokens?.token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, tokens.token);
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => readStoredAuth().tokens);
  const [user, setUser] = useState<UserProfile | null>(() => readStoredAuth().user);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!readStoredAuth().tokens?.token && canAccessStaffPortal(readStoredAuth().user?.role)
  );

  const setAuthState = useCallback((nextTokens: AuthTokens | null, nextUser: UserProfile | null) => {
    setTokens(nextTokens);
    setUser(nextUser);
    persistAuth(nextTokens, nextUser);
    setIsAuthenticated(!!nextTokens?.token && canAccessStaffPortal(nextUser?.role));
  }, []);

  const logout = useCallback(() => {
    setAuthState(null, null);
  }, []);

  useEffect(() => {
    configureApiClient({
      tokenProvider: () => tokens,
      onTokensUpdated: (nextTokens) => {
        setAuthState(nextTokens, user);
      },
      onUnauthorized: logout
    });
  }, [tokens, user, logout, setAuthState]);

  const hydrateUser = useCallback(async () => {
    if (!tokens || user) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await fetchCurrentUser();
      setAuthState(tokens, profile);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [tokens, user, logout, setAuthState]);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    const nextTokens: AuthTokens = { token: response.token };
    setAuthState(nextTokens, response.user);
    setIsLoading(false);
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
};

export default AuthContext;
