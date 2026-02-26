import React, { createContext, useContext, useEffect, useState } from "react"

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"
export type RolesStatus = "idle" | "loading" | "loaded"

export interface User {
  id: string
  email: string
  name?: string
  role: string
}

export interface AuthContextType {
  user: User | null
  accessToken: string | null

  authenticated: boolean
  isAuthenticated: boolean

  status: AuthStatus
  authStatus: AuthStatus
  rolesStatus: RolesStatus
  authReady: boolean
  isLoading: boolean

  error: string | null
  pendingPhoneNumber: string | null

  startOtp: (phone: string) => Promise<boolean>
  verifyOtp: (phone: string, code: string) => Promise<boolean>
  loginWithOtp: (phone: string, code: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthStatus>("idle")
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null)

  const authenticated = !!user
  const isAuthenticated = authenticated
  const isLoading = status === "loading"
  const authReady = status !== "idle"

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      setStatus("loading")
      setRolesStatus("loading")

      try {
        const res = await fetch("/api/auth/me")
        if (!mounted) return

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setAccessToken(data.accessToken ?? null)
          setStatus("authenticated")
          setRolesStatus("loaded")
        } else {
          setStatus("unauthenticated")
          setRolesStatus("idle")
        }
      } catch {
        setStatus("unauthenticated")
        setRolesStatus("idle")
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [])

  const startOtp = async (phone: string) => {
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

  const verifyOtp = async (phone: string, code: string) => {
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
    setStatus("authenticated")
    setRolesStatus("loaded")
    setPendingPhoneNumber(null)
    return true
  }

  const loginWithOtp = async (phone: string, code: string) => {
    return verifyOtp(phone, code)
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
    setStatus("authenticated")
    setRolesStatus("loaded")
    return true
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setStatus("unauthenticated")
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
        authenticated,
        isAuthenticated,
        status,
        authStatus: status,
        rolesStatus,
        authReady,
        isLoading,
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
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
