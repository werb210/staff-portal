import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { markOffline, markOnline, getPresence } from "./presenceStore.js";

interface Client {
  id: string;
  userId: string | null;
  socket: any;
}

const clients: Client[] = [];

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    const client: Client = { id: uuid(), userId: null, socket };
    clients.push(client);

    socket.on("message", (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "auth" && msg.userId) {
          client.userId = msg.userId;
        }

        if (msg.type === "identify") {
          const { userId } = msg.payload || {};
          if (!userId) return;
          client.userId = userId;
          markOnline(userId);
          broadcastToAll("presence_update", getPresence(userId));
        }

        if (msg.type === "typing") {
          if (!client.userId) return;
          const { toUserId, isTyping } = msg.payload || {};
          broadcastToUser(toUserId, "typing", {
            fromUserId: client.userId,
            isTyping,
          });
        }
      } catch (_) {}
    });

    socket.on("close", () => {
      const idx = clients.findIndex((c) => c.id === client.id);
      if (idx !== -1) clients.splice(idx, 1);

      if (client.userId) {
        markOffline(client.userId);
        broadcastToAll("presence_update", getPresence(client.userId));
      }
    });
  });
}

export function broadcastToUser(userId: string, type: string, payload: any) {
  for (const c of clients) {
    if (c.userId === userId) {
      c.socket.send(JSON.stringify({ type, payload }));
    }
  }
}

export function broadcastToAll(type: string, payload: any) {
  for (const c of clients) {
    c.socket.send(JSON.stringify({ type, payload }));
  }
}
