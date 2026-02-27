import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/auth/me", () => {
    return HttpResponse.json({
      id: "u1",
      email: "staff@example.com",
      role: "Staff",
    });
  }),

  http.post("*/api/auth/login", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("*/api/auth/verify", () => {
    return HttpResponse.json({ success: true });
  }),
];
