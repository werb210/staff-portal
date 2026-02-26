import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("/api/auth/me", () => {
    return HttpResponse.json(
      {
        user: {
          id: "test-user",
          email: "test@example.com",
          role: "Admin",
        },
      },
      { status: 200 }
    )
  }),

  http.post("/api/auth/request-otp", () => {
    return HttpResponse.json({ ok: true }, { status: 200 })
  }),

  http.post("/api/auth/verify-otp", async ({ request }) => {
    const body = (await request.json()) as { code?: string }

    if (body.code === "000000") {
      return HttpResponse.json({ error: "invalid_otp" }, { status: 400 })
    }

    return HttpResponse.json(
      {
        user: {
          id: "test-user",
          email: "test@example.com",
          role: "Admin",
        },
      },
      { status: 200 }
    )
  }),

  http.get("/api/submissions", () => {
    return HttpResponse.json(
      {
        submissions: [{ id: "sub-1", lender: "Test Lender", status: "sent" }],
      },
      { status: 200 }
    )
  }),
]
