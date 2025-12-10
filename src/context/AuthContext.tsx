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
const STORAGE_KEY = "staff-portal.auth";

const readStoredAuth = (): { tokens: AuthTokens | null; user: UserProfile | null } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tokens: null, user: null };
    return JSON.parse(raw) as { tokens: AuthTokens | null; user: UserProfile | null };
  } catch (error) {
    return { tokens: null, user: null };
  }
};

const persistAuth = (tokens: AuthTokens | null, user: UserProfile | null) => {
  if (!tokens) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tokens, user }));
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => readStoredAuth().tokens);
  const [user, setUser] = useState<UserProfile | null>(() => readStoredAuth().user);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    persistAuth(null, null);
  }, []);

  useEffect(() => {
    configureApiClient({
      tokenProvider: () => tokens,
      onTokensUpdated: (nextTokens) => {
        setTokens(nextTokens);
        persistAuth(nextTokens, user);
      },
      onUnauthorized: logout
    });
  }, [tokens, user, logout]);

  const hydrateUser = useCallback(async () => {
    if (!tokens || user) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await fetchCurrentUser();
      setUser(profile);
      persistAuth(tokens, profile);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [tokens, user, logout]);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
    setUser(response.user);
    persistAuth({ accessToken: response.accessToken, refreshToken: response.refreshToken }, response.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: !!tokens?.accessToken && canAccessStaffPortal(user?.role),
      isLoading,
      login,
      logout
    }),
    [isLoading, login, logout, tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
