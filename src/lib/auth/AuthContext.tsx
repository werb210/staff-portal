import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthAPI } from "../api/endpoints";
import { TOKEN_STORAGE_KEY, useAuthStore } from "./useAuthStore";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthContextShape = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextShape>(null as any);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.logout);

  async function loadSession() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      clearAuth();
      setLoading(false);
      return;
    }

    try {
      const res = await AuthAPI.me();
      setAuth(token, res.data.user);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function login(email: string, password: string) {
    const res = await AuthAPI.login({ email, password });
    const token = res.data.token;

    if (!token) return;

    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    try {
      const me = await AuthAPI.me();
      setAuth(token, me.data.user);
    } catch (error) {
      clearAuth();
      throw error;
    }
  }

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
