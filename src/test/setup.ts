import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock("@/auth/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/auth/AuthContext")>()

  let authState = {
    user: null as null | { id: string; email: string; role: string },
    status: "unauthenticated" as
      | "loading"
      | "unauthenticated"
      | "otp-sent"
      | "authenticated",
    location: "/login",
  }

  const listeners = new Set<() => void>()

  const notify = () => {
    listeners.forEach((l) => l())
  }

  const setAuth = (next: typeof authState) => {
    authState = next
    notify()
  }

  const requestOtp = vi.fn().mockImplementation(async () => {
    authState = { ...authState, status: "otp-sent" }
    notify()
    return { ok: true }
  })

  const verifyOtp = vi.fn().mockImplementation(async () => {
    authState = {
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
      status: "authenticated",
      location: "/dashboard",
    }
    notify()
    return { ok: true }
  })

  const hydrate = vi.fn().mockImplementation(async () => {
    authState = {
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
      status: "authenticated",
      location: "/dashboard",
    }
    notify()
    return { ok: true }
  })

  const logout = vi.fn().mockImplementation(() => {
    authState = {
      user: null,
      status: "unauthenticated",
      location: "/login",
    }
    notify()
  })

  return {
    ...actual,

    useAuth: () => {
      const { useEffect, useState } = require("react") as typeof import("react")

      const [, forceRender] = useState({})

      useEffect(() => {
        const rerender = () => forceRender({})
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
