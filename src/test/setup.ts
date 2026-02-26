import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.mock("@/auth/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/auth/AuthContext")>()

  type AuthState = {
    user: null | { id: string; email: string; role: string }
    role: string | null
    status: "loading" | "unauthenticated" | "authenticated"
    resolved: boolean
    location: string
  }

  let authState: AuthState = {
    user: null,
    role: null,
    status: "unauthenticated",
    resolved: true,
    location: "/login",
  }

  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())

  const setState = (next: Partial<AuthState>) => {
    authState = { ...authState, ...next }
    notify()
  }

  const requestOtp = vi.fn().mockResolvedValue({ ok: true })

  const verifyOtp = vi.fn().mockImplementation(async (code?: string) => {
    if (code === "000000") {
      return { ok: false, error: "invalid_otp" }
    }

    setState({
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
      role: "Admin",
      status: "authenticated",
      resolved: true,
      location: "/dashboard",
    })

    return { ok: true }
  })

  const hydrate = vi.fn().mockImplementation(async () => {
    setState({
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
      role: "Admin",
      status: "authenticated",
      resolved: true,
      location: "/dashboard",
    })

    return { ok: true }
  })

  const logout = vi.fn().mockImplementation(() => {
    setState({
      user: null,
      role: null,
      status: "unauthenticated",
      resolved: true,
      location: "/login",
    })
  })

  return {
    ...actual,

    useAuth: () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useEffect, useState } = require("react") as typeof import("react")
      const [, force] = useState({})

      useEffect(() => {
        const rerender = () => force({})
        listeners.add(rerender)
        return () => listeners.delete(rerender)
      }, [])

      return {
        ...authState,
        requestOtp,
        verifyOtp,
        hydrate,
        logout,
        login: vi.fn(),
        refresh: vi.fn(),
      }
    },
  }
})

global.fetch = vi.fn(async (url: string) => {
  if (url.includes('/api/auth/me')) {
    return {
      ok: true,
      json: async () => ({
        id: '1',
        email: 'restored@example.com',
        role: 'admin',
      }),
    } as Response
  }

  return {
    ok: true,
    json: async () => ({
      status: 'ok',
      submissions: [],
    }),
  } as Response
})
