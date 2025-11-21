import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import http from "@/lib/http";

type User = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("bf_token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete http.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bf_token");
    delete http.defaults.headers.common["Authorization"];
  }, []);

  useEffect(() => {
    const interceptor = http.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      http.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // fetch current auth user
  async function fetchMe() {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await http.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
      localStorage.removeItem("bf_token");
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchMe();
  }, []);

  async function login(email: string, password: string) {
    const res = await http.post("/api/auth/login", { email, password });

    const newToken = res.data.token;
    const newUser = res.data.user;

    localStorage.setItem("bf_token", newToken);

    setToken(newToken);
    setUser(newUser);
    http.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
