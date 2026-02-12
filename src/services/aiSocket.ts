import { getApiBaseUrl } from "@/config/api";
import { buildNotification } from "@/utils/notifications";
import { useNotificationsStore } from "@/state/notifications.store";

type AiSocketEventName = "escalated_chat" | "new_issue_report" | "new_chat_message";

type AiSocketEventPayload = {
  type?: AiSocketEventName;
  event?: AiSocketEventName;
  title?: string;
  body?: string;
  message?: string;
  chatId?: string;
  issueId?: string;
};

type Listener = (payload: AiSocketEventPayload) => void;

const listeners = new Map<AiSocketEventName, Set<Listener>>();

const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectAttempts = 0;
let reconnectTimer: number | null = null;
let socket: WebSocket | null = null;
let manuallyClosed = false;

const resolveWebSocketUrl = () => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl || typeof baseUrl !== "string") {
    return "ws://server-url/ws";
  }

  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    const url = new URL(baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    return url.toString();
  }

  return "ws://server-url/ws";
};

const notify = (payload: AiSocketEventPayload) => {
  const title = payload.title ?? "AI Support Update";
  const message = payload.message ?? payload.body ?? "You have a new AI support event.";
  useNotificationsStore.getState().addNotification(
    buildNotification(
      {
        title,
        body: message,
        type: "system_alert"
      },
      "in_app"
    )
  );
};

const emit = (event: AiSocketEventName, payload: AiSocketEventPayload) => {
  const handlers = listeners.get(event);
  handlers?.forEach((handler) => handler(payload));
};

const handleMessage = (event: MessageEvent) => {
  let payload: AiSocketEventPayload;
  try {
    payload = JSON.parse(String(event.data)) as AiSocketEventPayload;
  } catch {
    return;
  }

  const eventName = payload.type ?? payload.event;
  if (!eventName) return;

  if (eventName === "escalated_chat" || eventName === "new_issue_report" || eventName === "new_chat_message") {
    notify(payload);
    emit(eventName, payload);
  }
};

const scheduleReconnect = () => {
  if (manuallyClosed || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
  reconnectAttempts += 1;
  const timeout = Math.min(1000 * reconnectAttempts, 10_000);
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectAiSocket();
  }, timeout);
};

export const connectAiSocket = () => {
  if (typeof window === "undefined") return;
  manuallyClosed = false;

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const wsUrl = resolveWebSocketUrl();
  socket = new WebSocket(wsUrl);

  socket.addEventListener("open", () => {
    reconnectAttempts = 0;
  });

  socket.addEventListener("message", handleMessage);

  socket.addEventListener("close", () => {
    if (!manuallyClosed) {
      scheduleReconnect();
    }
  });

  socket.addEventListener("error", () => {
    socket?.close();
  });
};

export const disconnectAiSocket = () => {
  manuallyClosed = true;
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  socket?.close();
  socket = null;
};

export const reconnectAiSocket = () => {
  disconnectAiSocket();
  manuallyClosed = false;
  connectAiSocket();
};

export const subscribeAiSocket = (event: AiSocketEventName, listener: Listener) => {
  const existing = listeners.get(event) ?? new Set<Listener>();
  existing.add(listener);
  listeners.set(event, existing);
  return () => {
    const current = listeners.get(event);
    current?.delete(listener);
  };
};

export const initializeAiSocketClient = () => {
  if (import.meta.env.MODE === "test") return;
  connectAiSocket();
  if (typeof window !== "undefined") {
    (window as Window & { portalRealtime?: { reconnect?: () => void } }).portalRealtime = {
      reconnect: reconnectAiSocket
    };
  }
};
