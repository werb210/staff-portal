import { getRequestId } from "@/utils/requestId";
import { setUiFailure } from "@/utils/uiFailureStore";

type RouteDescriptor = {
  path: string;
  method?: string;
};

export const portalApiRoutes: RouteDescriptor[] = [
  { method: "POST", path: "/auth/otp/start" },
  { method: "POST", path: "/api/auth/otp/verify" },
  { method: "GET", path: "/auth/me" },
  { method: "POST", path: "/auth/logout" },
  { method: "GET", path: "/api/_int/routes" }
];

const normalizePath = (path: string) =>
  path
    .replace(/\/+$/, "")
    .replace(/^\/api(?=\/|$)/, "");

const extractServerRoutes = (payload: unknown): RouteDescriptor[] => {
  if (Array.isArray(payload)) {
    return payload.flatMap((entry) => {
      if (typeof entry === "string") {
        return [{ path: entry }];
      }
      if (entry && typeof entry === "object") {
        const record = entry as { path?: string; method?: string; route?: string };
        const resolved = record.path ?? record.route;
        if (resolved) {
          return [{ path: resolved, method: record.method }];
        }
      }
      return [];
    });
  }

  if (payload && typeof payload === "object") {
    const record = payload as { routes?: unknown };
    if (Array.isArray(record.routes)) {
      return extractServerRoutes(record.routes);
    }
  }

  return [];
};

const routeLabel = (route: RouteDescriptor) =>
  `${route.method ? `${route.method} ` : ""}${route.path}`;

export const runRouteAudit = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  const requestId = getRequestId();
  console.info("Route audit start", {
    requestId,
    routeCount: portalApiRoutes.length
  });

  const response = await fetch("/api/_int/routes", {
    headers: { "X-Request-Id": requestId }
  });

  if (!response.ok) {
    console.error("Route audit fetch failed", {
      requestId,
      status: response.status
    });
    throw new Error(`Route audit failed with status ${response.status}`);
  }

  const payload = await response.json().catch(() => null);
  const serverRoutes = extractServerRoutes(payload);
  const serverSet = new Set(serverRoutes.map((route) => normalizePath(route.path)));

  const missing = portalApiRoutes.filter(
    (route) => !serverSet.has(normalizePath(route.path))
  );

  if (missing.length > 0) {
    const missingLabels = missing.map(routeLabel);
    console.error("Route audit mismatch", {
      requestId,
      missing: missingLabels,
      serverCount: serverRoutes.length
    });
    setUiFailure({
      message: "Server route mismatch detected.",
      details: `Missing routes: ${missingLabels.join(", ")} | Request ID: ${requestId}`,
      timestamp: Date.now()
    });
    throw new Error(`Route audit mismatch: ${missingLabels.join(", ")}`);
  }

  console.info("Route audit complete", {
    requestId,
    serverCount: serverRoutes.length
  });
};
