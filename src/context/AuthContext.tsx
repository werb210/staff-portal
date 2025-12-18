import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "@/utils/api";
import { canAccessStaffPortal } from "@/utils/roles";

const TOKEN_KEY = "auth_token";
const USER_KEY = "staff-portal.user";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<any>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated =
    !!token && !!user && canAccessStaffPortal(user.role);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    const nextToken = res.data.token;
    const nextUser = res.data.user;

    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
