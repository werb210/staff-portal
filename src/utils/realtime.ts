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
    console.warn("Realtime reconnect failed.", { error });
  }
};
