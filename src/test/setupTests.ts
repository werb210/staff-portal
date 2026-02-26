import { vi } from "vitest"

const okJson = (data: unknown) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response)

const errorJson = (status: number, data: unknown) =>
  Promise.resolve({
    ok: false,
    status,
    json: async () => data,
  } as Response)

global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  const method = init?.method ?? "GET"

  // Hydration
  if (url.includes("/api/auth/me") && method === "GET") {
    return okJson({
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
    })
  }

  // OTP request
  if (url.includes("/api/auth/request-otp") && method === "POST") {
    return okJson({ ok: true })
  }

  // OTP verify
  if (url.includes("/api/auth/verify-otp") && method === "POST") {
    const body = init?.body ? JSON.parse(String(init.body)) : {}
    if (body.code === "000000") {
      return errorJson(400, { error: "invalid_otp" })
    }

    return okJson({
      user: {
        id: "test-user",
        email: "test@example.com",
        role: "Admin",
      },
    })
  }

  // Accept document
  if (url.includes("/accept") && method === "POST") {
    return okJson({ ok: true })
  }

  // Reject document
  if (url.includes("/reject") && method === "POST") {
    return okJson({ ok: true })
  }

  // Submissions endpoint
  if (url.includes("/submissions") && method === "GET") {
    return okJson({
      submissions: [
        {
          id: "sub-1",
          lender: "Test Lender",
          status: "sent",
        },
      ],
    })
  }

  return errorJson(404, {})
})
