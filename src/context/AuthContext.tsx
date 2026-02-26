import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react"

export type Role = "admin" | "staff"
export type AppSilo = "bf" | "bi" | "slf"

export type AuthUser = {
  id: string
  email: string
  role: string
}

export type AuthState = "authenticated" | "unauthenticated" | "loading"

const roleAllowedSilos: Record<Role, AppSilo[]> = {
  admin: ["bf", "bi", "slf"],
  staff: ["bf", "bi"],
}

type AuthContextType = {
  user: AuthUser | null
  authState: AuthState
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void

  // Backward compatibility for existing app usage
  role: Role | null
  token: string | null
  canAccessSilo: (silo: AppSilo) => boolean
  allowedSilos: AppSilo[]

  // compatibility for existing tests
  setAuth: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authState, setAuthState] = useState<AuthState>("loading")

  useEffect(() => {
    setAuthState("unauthenticated")
  }, [])

  const login = async (email: string, password: string) => {
    if (!email || !password) return false

    const fakeUser: AuthUser = {
      id: "1",
      email,
      role: "admin",
    }

    setUser(fakeUser)
    setAuthState("authenticated")
    return true
  }

  const logout = () => {
    setUser(null)
    setAuthState("unauthenticated")
  }

  const setAuth = (newUser: AuthUser | null) => {
    setUser(newUser)
    setAuthState(newUser ? "authenticated" : "unauthenticated")
  }

  const role: Role | null = user?.role === "staff" ? "staff" : user ? "admin" : null
  const allowedSilos = role ? roleAllowedSilos[role] : []
  const canAccessSilo = (silo: AppSilo) => allowedSilos.includes(silo)

  const value = useMemo(
    () => ({
      user,
      authState,
      isAuthenticated: authState === "authenticated",
      isLoading: authState === "loading",
      login,
      logout,
      role,
      token: null,
      canAccessSilo,
      allowedSilos,
      setAuth,
    }),
    [user, authState, role, allowedSilos]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
