import type { UserRole } from "@/utils/roles";
import { getStoredUser } from "@/services/token";

export type UiTelemetryEvent = "page_loaded" | "data_loaded" | "permission_blocked" | "api_error";

export type UiTelemetryPayload = {
  route?: string;
  role?: UserRole | "UNKNOWN";
  requestId?: string;
  [key: string]: unknown;
};

const getRoutePath = () => {
  if (typeof window === "undefined") return "unknown";
  return window.location.pathname || "unknown";
};

const getRole = (): UserRole | "UNKNOWN" => {
  const user = getStoredUser<{ role?: UserRole }>();
  return user?.role ?? "UNKNOWN";
};

export const emitUiTelemetry = (event: UiTelemetryEvent, payload: UiTelemetryPayload = {}) => {
  const basePayload = {
    event,
    route: getRoutePath(),
    role: getRole()
  };
  console.info("[telemetry] ui", { ...basePayload, ...payload });
};
