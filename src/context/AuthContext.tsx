import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../lib/api";
import { getToken, logout, setRole, setToken } from "../lib/storage";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenState) setToken(tokenState);
    else logout();
  }, [tokenState]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const result = await api.post("/api/auth/login", { email, password });
      const { token, role, user: userData } = result.data;

      setTokenState(token);
      if (role) setRole(role);
      if (userData) setUser(userData);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setTokenState(null);
    logout();
  }

  return (
    <AuthContext.Provider value={{ user, token: tokenState, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
