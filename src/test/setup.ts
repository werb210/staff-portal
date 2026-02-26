import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.mock("@/auth/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/auth/AuthContext")>()
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react")

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

  const setAuth = (next: Partial<AuthState>) => {
    authState = { ...authState, ...next }
    notify()
  }

  const requestOtp = vi.fn().mockResolvedValue({ ok: true })

  const verifyOtp = vi.fn().mockImplementation(async (code?: string) => {
    if (code === "000000") {
      return { ok: false, error: "invalid_otp" }
    }

    setAuth({
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
    setAuth({
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
    setAuth({
      user: null,
      role: null,
      status: "unauthenticated",
      resolved: true,
      location: "/login",
    })
  })

  const useAuth = () => {
    const [, force] = React.useState({})

    React.useEffect(() => {
      const rerender = () => force({})
      listeners.add(rerender)
      return () => listeners.delete(rerender)
    }, [])

    return {
      ...authState,
      setAuth,
      requestOtp,
      verifyOtp,
      hydrate,
      logout,
      login: vi.fn(),
      refresh: vi.fn(),
    }
  }

  return {
    ...actual,
    useAuth,
    setAuth,
    AuthProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
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
