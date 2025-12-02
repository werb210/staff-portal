import { WebSocketServer, WebSocket } from "ws";

const userSockets = new Map<string, Set<WebSocket>>();

export function registerUserSocket(userId: string, socket: WebSocket) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId)?.add(socket);

  socket.on("close", () => {
    const sockets = userSockets.get(userId);
    sockets?.delete(socket);
    if (sockets && sockets.size === 0) userSockets.delete(userId);
  });
}

export function sendToUser(userId: string, message: any) {
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) return;

  const payload = typeof message === "string" ? message : JSON.stringify(message);
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
}

export function createWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, req) => {
    const url = new URL(req.url || "", "http://localhost");
    const userId = url.searchParams.get("userId") || url.searchParams.get("token");
    if (userId) {
      registerUserSocket(userId, socket);
    }
  });

  return wss;
}
