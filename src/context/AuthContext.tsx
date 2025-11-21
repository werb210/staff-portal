import { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/http";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextState {
  user: User | null;
  loading: boolean;
  setUserAndToken: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextState>({
  user: null,
  loading: true,
  setUserAndToken: () => {},
  logout: () => {},
});

export default function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on boot
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    http
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      })
      .finally(() => setLoading(false));
  }, []);

  function setUserAndToken(token: string, user: User) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUserAndToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
