import { api } from "./client";

export function notifyRouteChange() {
  /* noop – telemetry only */
}

api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      // DO NOT clear auth here
      // Explicit logout only
    }
    return Promise.reject(err);
  }
);
