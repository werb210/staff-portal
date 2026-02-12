import { http, HttpResponse } from "msw";

export const defaultHandlers = [
  http.get("*/api/crm/leads/count", () => HttpResponse.json({ count: 0 })),
  http.get("*/api/_int/production-readiness", () => HttpResponse.json({ ready: true, status: "ok" })),
  http.get("*/api/support/live/count", () => HttpResponse.json({ count: 0 })),
  http.get("*/api/public/lender-count", () => HttpResponse.json({ count: 0 })),
  http.get("ws://localhost/ws", () => new HttpResponse("OK", { status: 200 }))
];
