import { http, HttpResponse } from "msw";

export const handlers = [
  http.options("*/api/audit/activity", () => new HttpResponse(null, { status: 204 })),
  http.post("*/api/audit/activity", () => new HttpResponse(null, { status: 204 })),

  http.get("*/health", () => HttpResponse.json({ status: "ok" }, { status: 200 })),
  http.get("*/api/_int/production-readiness", () => HttpResponse.json({ ready: true, status: "ok" }, { status: 200 })),
  http.get("*/api/crm/leads/count", () => HttpResponse.json({ count: 0 }, { status: 200 })),
  http.get("*/api/public/lender-count", () => HttpResponse.json({ count: 0 }, { status: 200 })),
  http.get("*/api/analytics/campaign-revenue", () => HttpResponse.json([], { status: 200 })),
  http.get("*/api/analytics/commission-trend", () => HttpResponse.json([], { status: 200 })),
  http.get("*/api/analytics/revenue-summary", () => HttpResponse.json({}, { status: 200 })),
  http.get("*/api/analytics/lender-performance", () => HttpResponse.json([], { status: 200 })),
  http.get("*/api/analytics/priority-leads", () => HttpResponse.json([], { status: 200 }))
];
