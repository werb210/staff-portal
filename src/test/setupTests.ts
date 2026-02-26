import { vi } from "vitest"

global.fetch = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input)

  if (url.includes("/api/auth/me")) {
    return {
      ok: true,
      json: async () => ({
        user: {
          id: "test-user",
          email: "test@example.com",
          role: "Admin",
        },
      }),
    } as Response
  }

  if (url.includes("/api/auth/request-otp")) {
    return {
      ok: true,
      json: async () => ({ ok: true }),
    } as Response
  }

  if (url.includes("/api/auth/verify-otp")) {
    return {
      ok: true,
      json: async () => ({
        user: {
          id: "test-user",
          email: "test@example.com",
          role: "Admin",
        },
      }),
    } as Response
  }

  return {
    ok: false,
    json: async () => ({}),
  } as Response
})
