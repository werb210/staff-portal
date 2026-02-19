import { logger } from "@/utils/logger";
type RealtimeConnector = {
  reconnect?: () => void;
};

export const reconnectRealtime = () => {
  if (typeof window === "undefined") return;
  const connector = (window as Window & { portalRealtime?: RealtimeConnector }).portalRealtime;
  if (!connector?.reconnect) return;
  try {
    connector.reconnect();
  } catch (error) {
    logger.warn("Realtime reconnect failed.", { error });
  }
};
