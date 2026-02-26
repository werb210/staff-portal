import React, { createContext, useContext, useEffect, useState } from "react"

export type AuthStatus = "idle" | "pending" | "authenticated" | "unauthenticated"
export type RolesStatus = "idle" | "loading" | "loaded"

interface User {
  id: string
  email: string
  role: string
}

export interface AuthContextType {
  user: User | null
  authenticated: boolean
  authStatus: AuthStatus
  rolesStatus: RolesStatus
  authReady: boolean
  accessToken: string | null
  error: string | null
  pendingPhoneNumber: string | null

  startOtp: (phone: string) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>

  setAuth: (user: User | null) => void
  setAuthenticated: (val: boolean) => void
  setUser: (user: User | null) => void
  setAuthState: (state: Partial<AuthContextType>) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle")
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>("idle")
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null)

  const authenticated = !!user
  const authReady = authStatus !== "idle" && authStatus !== "pending"

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      setAuthStatus("pending")
      try {
        const res = await fetch("/api/auth/me")
        if (!mounted) return

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setAccessToken(data.accessToken ?? null)
          setAuthStatus("authenticated")
          setRolesStatus("loaded")
        } else {
          setAuthStatus("unauthenticated")
        }
      } catch {
        setAuthStatus("unauthenticated")
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [])

  async function startOtp(phone: string) {
    setError(null)
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    if (!res.ok) {
      setError("otp_request_failed")
      throw new Error("otp_request_failed")
    }

    setPendingPhoneNumber(phone)
  }

  async function verifyOtp(code: string) {
    if (!pendingPhoneNumber) throw new Error("no_pending_phone")

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: pendingPhoneNumber, code }),
    })

    if (!res.ok) {
      setError("invalid_otp")
      throw new Error("invalid_otp")
    }

    const data = await res.json()
    setUser(data.user)
    setAccessToken(data.accessToken ?? null)
    setAuthStatus("authenticated")
    setRolesStatus("loaded")
    setPendingPhoneNumber(null)
  }

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      setError("login_failed")
      throw new Error("login_failed")
    }

    const data = await res.json()
    setUser(data.user)
    setAccessToken(data.accessToken ?? null)
    setAuthStatus("authenticated")
    setRolesStatus("loaded")
  }

  function setAuth(user: User | null) {
    setUser(user)
    setAuthStatus(user ? "authenticated" : "unauthenticated")
  }

  function setAuthenticated(val: boolean) {
    setAuthStatus(val ? "authenticated" : "unauthenticated")
  }

  function setAuthState(state: Partial<AuthContextType>) {
    if (state.user !== undefined) setUser(state.user)
    if (state.accessToken !== undefined) setAccessToken(state.accessToken)
  }

  function clearAuth() {
    setUser(null)
    setAccessToken(null)
    setAuthStatus("unauthenticated")
    setRolesStatus("idle")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        authStatus,
        rolesStatus,
        authReady,
        accessToken,
        error,
        pendingPhoneNumber,
        startOtp,
        verifyOtp,
        login,
        setAuth,
        setAuthenticated,
        setUser,
        setAuthState,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
