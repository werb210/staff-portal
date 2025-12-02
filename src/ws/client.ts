import { getAuthToken } from "../utils/authToken";
import { handleNotification } from "./listeners/notifications";

let socket: WebSocket | null = null;
let reconnectTimer: number | undefined;

function buildUrl() {
  const base = import.meta.env.VITE_WS_URL;
  if (!base) return null;

  try {
    const url = new URL(base);
    const token = getAuthToken();
    if (token) url.searchParams.set("token", token);
    return url.toString();
  } catch {
    return base;
  }
}

function handleMessage(event: MessageEvent) {
  try {
    const msg = JSON.parse(event.data);
    handleNotification(msg);
  } catch {
    // Ignore malformed messages
  }
}

export function initWebSocket() {
  if (socket || typeof window === "undefined") return socket;
  const url = buildUrl();
  if (!url) return null;

  socket = new WebSocket(url);
  socket.onmessage = handleMessage;
  socket.onclose = () => {
    socket = null;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    reconnectTimer = window.setTimeout(() => initWebSocket(), 3000);
  };

  return socket;
}

export function getWebSocket() {
  return socket;
}
