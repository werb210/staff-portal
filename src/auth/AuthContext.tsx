import React, { createContext, useContext, useEffect, useState } from "react"

type Status = "pending" | "resolved"

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  authenticated: boolean
  status: Status
  loginWithOtp: (phone: string, code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<Status>("pending")

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      try {
        const res = await fetch("/api/auth/me")
        if (!mounted) return

        if (res.ok) {
          const data = await res.json()
          setUser(data.user ?? null)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        if (mounted) setStatus("resolved")
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [])

  async function loginWithOtp(phone: string, code: string) {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    })

    if (!res.ok) {
      throw new Error("invalid_otp")
    }

    const data = await res.json()
    setUser(data.user)
    setStatus("resolved")
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setStatus("resolved")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated: !!user,
        status,
        loginWithOtp,
        logout,
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
