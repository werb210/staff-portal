import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/auth/me", () => {
    return HttpResponse.json({
      id: "test-user",
      email: "test@example.com",
      role: "admin",
    });
  }),

  http.post("*/api/auth/login", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("*/api/auth/verify", () => {
    return HttpResponse.json({ success: true });
  }),
];
