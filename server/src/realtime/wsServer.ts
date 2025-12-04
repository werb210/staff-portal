import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

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
      } catch (_) {}
    });

    socket.on("close", () => {
      const idx = clients.findIndex((c) => c.id === client.id);
      if (idx !== -1) clients.splice(idx, 1);
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
