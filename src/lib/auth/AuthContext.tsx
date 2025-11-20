import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthAPI } from "../api/endpoints";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    try {
      const res = await AuthAPI.me();
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function login(email: string, password: string) {
    const res = await AuthAPI.login({ email, password });
    const token = res.data.token;

    localStorage.setItem("bf_token", token);
    await loadSession();
  }

  function logout() {
    localStorage.removeItem("bf_token");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
