import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session
  useEffect(() => {
    async function loadMe() {
      const token = localStorage.getItem("bf_staff_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/api/users/me");
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("bf_staff_token");
      }
      setLoading(false);
    }
    loadMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("bf_staff_token", res.data.token);
    const me = await api.get("/api/users/me");
    setUser(me.data.user);
  };

  const logout = () => {
    localStorage.removeItem("bf_staff_token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
