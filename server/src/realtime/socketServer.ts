import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

interface AuthenticatedClient {
  userId: string;
  socket: WebSocket;
}

const clients: AuthenticatedClient[] = [];

export function initSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket, req) => {
    try {
      const params = new URLSearchParams(req.url?.replace("/?", "") || "");
      const userId = params.get("userId");

      if (!userId) {
        socket.close();
        return;
      }

      clients.push({ userId, socket });

      socket.on("message", (_msg) => {
        // No inbound messages required yet
      });

      socket.on("close", () => {
        const idx = clients.findIndex((c) => c.socket === socket);
        if (idx !== -1) clients.splice(idx, 1);
      });
    } catch (e) {
      socket.close();
    }
  });
}

export function pushNotification(userId: string, payload: any) {
  for (const c of clients) {
    if (c.userId === userId) {
      c.socket.send(JSON.stringify(payload));
    }
  }
}

export function pushBroadcast(payload: any) {
  for (const c of clients) {
    c.socket.send(JSON.stringify(payload));
  }
}
