import React, { createContext, useContext, useEffect, useState } from "react"

export type AuthState =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"

export interface User {
  id: string
  email: string
  name?: string
  role: string
}

export interface AuthContextType {
  user: User | null
  accessToken: string | null

  status: AuthState
  isAuthenticated: boolean
  isLoading: boolean
  authReady: boolean

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthState>("idle")

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  const authReady = status !== "idle"

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      setStatus("loading")
      try {
        const res = await fetch("/api/auth/me")

        if (!mounted) return

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setAccessToken(data.accessToken ?? null)
          setStatus("authenticated")
        } else {
          setStatus("unauthenticated")
        }
      } catch {
        setStatus("unauthenticated")
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    setStatus("loading")

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      setStatus("unauthenticated")
      return false
    }

    const data = await res.json()
    setUser(data.user)
    setAccessToken(data.accessToken ?? null)
    setStatus("authenticated")
    return true
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setStatus("unauthenticated")
  }

  const clearAuth = () => {
    logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        status,
        isAuthenticated,
        isLoading,
        authReady,
        login,
        logout,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
