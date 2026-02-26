import React, { createContext, useContext, useEffect, useState } from "react"

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"
export type RolesStatus = "idle" | "loading" | "loaded"

export interface User {
  id: string
  email: string
  role: string
}

export interface AuthContextType {
  user: User | null
  accessToken: string | null

  isAuthenticated: boolean
  isLoading: boolean

  authStatus: AuthStatus
  rolesStatus: RolesStatus
  authReady: boolean

  error: string | null
  pendingPhoneNumber: string | null

  startOtp: (payload: { phone: string }) => Promise<boolean>
  verifyOtp: (payload: { phone: string; code: string }) => Promise<boolean>
  loginWithOtp: (payload: { phone: string; code: string }) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle")
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>("idle")

  const [error, setError] = useState<string | null>(null)
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null)

  const isAuthenticated = !!user
  const isLoading = authStatus === "loading"
  const authReady = authStatus !== "idle"

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      setAuthStatus("loading")
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

  const startOtp = async ({ phone }: { phone: string }) => {
    setError(null)
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    if (!res.ok) {
      setError("otp_request_failed")
      return false
    }

    setPendingPhoneNumber(phone)
    return true
  }

  const verifyOtp = async ({ phone, code }: { phone: string; code: string }) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    })

    if (!res.ok) {
      setError("invalid_otp")
      return false
    }

    const data = await res.json()
    setUser(data.user)
    setAccessToken(data.accessToken ?? null)
    setAuthStatus("authenticated")
    setRolesStatus("loaded")
    setPendingPhoneNumber(null)
    return true
  }

  const loginWithOtp = async ({ phone, code }: { phone: string; code: string }) => {
    return verifyOtp({ phone, code })
  }

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      setError("login_failed")
      return false
    }

    const data = await res.json()
    setUser(data.user)
    setAccessToken(data.accessToken ?? null)
    setAuthStatus("authenticated")
    setRolesStatus("loaded")
    return true
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setAuthStatus("unauthenticated")
    setRolesStatus("idle")
  }

  const clearAuth = () => {
    logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        authStatus,
        rolesStatus,
        authReady,
        error,
        pendingPhoneNumber,
        startOtp,
        verifyOtp,
        loginWithOtp,
        login,
        logout,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
