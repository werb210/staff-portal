import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock("@/auth/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/auth/AuthContext")>()

  const mockSetAuth = vi.fn()
  const mockVerifyOtp = vi.fn().mockResolvedValue({ ok: true })
  const mockRequestOtp = vi.fn().mockResolvedValue({ ok: true })
  const mockHydrate = vi.fn().mockResolvedValue({ ok: true })
  const mockLogout = vi.fn()

  return {
    ...actual,

    useAuth: () => ({
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
      status: "authenticated",
      location: "/dashboard",

      setAuth: mockSetAuth,
      verifyOtp: mockVerifyOtp,
      requestOtp: mockRequestOtp,
      hydrate: mockHydrate,
      logout: mockLogout,

      login: vi.fn(),
      refresh: vi.fn(),
    }),
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
