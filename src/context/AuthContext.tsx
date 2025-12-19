import { createContext, useContext } from "react";

export type StaffUser = {
  id?: string;
  email?: string;
  role: string;
  name?: string;
  requiresOtp?: boolean;
};

export type AuthTokens = {
  token: string;
};

export type AuthContextValue = {
  user: StaffUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const defaultUser: StaffUser = {
  id: "1",
  email: "admin@example.com",
  role: "admin",
  name: "Admin User"
};

const defaultValue: AuthContextValue = {
  user: defaultUser,
  tokens: { token: "demo-token" },
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  logout: () => {}
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;

export const useAuth = () => useContext(AuthContext);
