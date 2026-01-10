import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginService, logout as logoutService, type AuthenticatedUser, type LoginSuccess } from "@/services/auth";
import { fetchCurrentUser } from "@/api/auth";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredRefreshToken,
  setStoredUser
} from "@/services/token";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { redirectToLogin } from "@/services/api";
import { setApiStatus } from "@/state/apiStatus";
import { ApiError } from "@/api/client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextType = {
  user: AuthenticatedUser | null;
  token: string | null;
  status: AuthStatus;
  authReady: boolean;
  login: (email: string, password: string) => Promise<LoginSuccess>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storedToken = getStoredAccessToken();
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser<AuthenticatedUser>());
  const [token, setToken] = useState<string | null>(() => storedToken);
  const [status, setStatus] = useState<AuthStatus>(storedToken ? "authenticated" : "unauthenticated");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return registerAuthFailureHandler((reason) => {
      if (reason === "forbidden") {
        setApiStatus("forbidden");
        return;
      }
      clearStoredAuth();
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
      setAuthReady(true);
      redirectToLogin();
    });
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const existingToken = getStoredAccessToken();
    if (!existingToken) {
      setStatus("unauthenticated");
      setAuthReady(true);
      return;
    }

    setStatus("loading");
    try {
      const currentUser = await fetchCurrentUser();
      setStoredUser(currentUser);
      setUser(currentUser);
      setToken(existingToken);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setApiStatus("forbidden");
        setStatus("authenticated");
      } else {
        clearStoredAuth();
        setUser(null);
        setToken(null);
        setStatus("unauthenticated");
      }
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginService(email, password);
    setStoredAccessToken(result.accessToken);
    setStoredRefreshToken(result.refreshToken);
    setStoredUser(result.user);
    setToken(result.accessToken);
    setUser(result.user);
    setAuthReady(false);
    await loadCurrentUser();
    return result;
  }, [loadCurrentUser]);

  const logout = useCallback(() => {
    void logoutService().catch((error) => {
      console.error("Logout failed", error);
    });
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
    redirectToLogin();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, status, authReady, login, logout }),
    [authReady, login, logout, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
