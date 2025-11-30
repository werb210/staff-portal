import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

interface WSClient {
  socket: WebSocket;
  userId: string;
  silo: string;
  apps: Set<string>;
}

class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients: WSClient[] = [];

  initialize(wss: WebSocketServer) {
    this.wss = wss;

    wss.on("connection", (socket, req) => {
      try {
        const params = new URLSearchParams(req.url?.split("?")[1]);
        const token = params.get("token");
        const appId = params.get("applicationId");

        if (!token) {
          socket.close(4001, "Missing auth token");
          return;
        }

        let decoded: any;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {
          socket.close(4002, "Invalid auth token");
          return;
        }

        const userId = decoded.userId;
        const silo = decoded.silo;

        if (!userId || !silo) {
          socket.close(4003, "Missing user or silo in token");
          return;
        }

        const client: WSClient = {
          socket,
          userId,
          silo,
          apps: new Set(),
        };

        if (appId) client.apps.add(appId);

        this.clients.push(client);

        // Heartbeat to keep Azure from killing idle WS
        const heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000); // 30 sec

        socket.on("close", () => {
          clearInterval(heartbeat);
          this.clients = this.clients.filter((c) => c.socket !== socket);
        });

        socket.on("message", (msg) => {
          // Future: staff-to-client WS
          // For V1, receiving messages is not needed
        });
      } catch (err) {
        socket.close(4000, "WS initialization error");
      }
    });
  }

  /**
   * Broadcast to all clients in the SAME silo, SAME application room
   */
  broadcastToApplication(silo: string, applicationId: string, message: any) {
    const data = JSON.stringify(message);

    for (const c of this.clients) {
      if (c.silo !== silo) continue;
      if (!c.apps.has(applicationId)) continue;
      if (c.socket.readyState === WebSocket.OPEN) {
        c.socket.send(data);
      }
    }
  }

  /**
   * Broadcast to all clients in same silo (full silo broadcast)
   */
  broadcastToSilo(silo: string, message: any) {
    const data = JSON.stringify(message);

    for (const c of this.clients) {
      if (c.silo !== silo) continue;
      if (c.socket.readyState === WebSocket.OPEN) {
        c.socket.send(data);
      }
    }
  }

  /**
   * Server-side event emitters
   */
  emitDocumentUpdate(silo: string, applicationId: string) {
    this.broadcastToApplication(silo, applicationId, {
      type: "document",
      applicationId,
    });
  }

  emitChatMessage(silo: string, applicationId: string, msg: any) {
    this.broadcastToApplication(silo, applicationId, {
      type: "message",
      applicationId,
      msg,
    });
  }

  emitPipelineUpdate(silo: string, applicationId: string) {
    this.broadcastToApplication(silo, applicationId, {
      type: "pipeline-update",
      applicationId,
    });
  }
}

export const wsHub = new WebSocketHub();
