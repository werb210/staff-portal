// ---- Portal Tracking Layer ----
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const trackPortalEvent = (
  eventName: string,
  payload: Record<string, any> = {}
) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      timestamp: Date.now(),
      app: "portal",
      ...payload,
    });
  }
};

