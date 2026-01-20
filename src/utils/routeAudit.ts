import { getRequestId } from "@/utils/requestId";
import { emitUiTelemetry } from "@/utils/uiTelemetry";
import { setUiFailure } from "@/utils/uiFailureStore";

type RouteDescriptor = {
  path: string;
  method?: string;
};

export const portalApiRoutes: RouteDescriptor[] = [
  { method: "POST", path: "/auth/otp/start" },
  { method: "POST", path: "/auth/otp/verify" },
  { method: "GET", path: "/auth/me" },
  { method: "POST", path: "/auth/logout" },
  { method: "GET", path: "/api/_int/routes" }
];

const AUTH_ROUTE_PREFIXES = ["/auth/otp", "/auth/me", "/auth/logout"];

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

const isAuthBootstrapRoute = (route: RouteDescriptor) =>
  AUTH_ROUTE_PREFIXES.some((prefix) => normalizePath(route.path).startsWith(prefix));

export const runRouteAudit = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  const requestId = getRequestId();
  console.info("Route audit start", {
    requestId,
    routeCount: portalApiRoutes.length
  });

  try {
    const response = await fetch("/api/_int/routes", {
      headers: { "X-Request-Id": requestId }
    });

    if (!response.ok) {
      console.warn("Route audit fetch failed", {
        requestId,
        status: response.status
      });
      setUiFailure({
        message: "Route audit fetch failed.",
        details: `Status ${response.status} | Request ID: ${requestId}`,
        timestamp: Date.now()
      });
      return;
    }

    const payload = await response.json().catch(() => null);
    const serverRoutes = extractServerRoutes(payload);
    const serverSet = new Set(serverRoutes.map((route) => normalizePath(route.path)));

    const missing = portalApiRoutes.filter(
      (route) => !serverSet.has(normalizePath(route.path))
    );

    const missingAuthRoutes = missing.filter(isAuthBootstrapRoute);
    const missingNonAuthRoutes = missing.filter((route) => !isAuthBootstrapRoute(route));

    if (missingAuthRoutes.length > 0) {
      const missingLabels = missingAuthRoutes.map(routeLabel);
      console.warn("Route audit bypassed for auth bootstrap route", {
        requestId,
        missing: missingLabels
      });
      emitUiTelemetry("api_error", {
        requestId,
        missing: missingLabels,
        reason: "route_audit_auth_bypass"
      });
    }

    if (missingNonAuthRoutes.length > 0) {
      const missingLabels = missingNonAuthRoutes.map(routeLabel);
      console.warn("Route audit mismatch", {
        requestId,
        missing: missingLabels,
        serverCount: serverRoutes.length
      });
      setUiFailure({
        message: "Server route mismatch detected.",
        details: `Missing routes: ${missingLabels.join(", ")} | Request ID: ${requestId}`,
        timestamp: Date.now()
      });
      return;
    }

    console.info("Route audit complete", {
      requestId,
      serverCount: serverRoutes.length
    });
  } catch (error) {
    console.warn("Route audit failed.", { requestId, error });
    setUiFailure({
      message: "Route audit failed unexpectedly.",
      details: `Request ID: ${requestId}`,
      timestamp: Date.now()
    });
  }
};
