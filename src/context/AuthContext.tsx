import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type Role = "admin" | "staff";

interface AuthContextType {
  role: Role;
}

const AuthContext = createContext<AuthContextType>({
  role: "staff"
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Replace with real JWT decode later
  const role: Role = "admin";

  return <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
