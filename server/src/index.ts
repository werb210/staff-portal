import http from "http";
import { WebSocketServer } from "ws";
import app from "./app.js";
import { wsHub } from "./services/wsHub.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// WEBSOCKET SERVER — hardened with auth & silo routing
const wss = new WebSocketServer({
  noServer: true,
});

// upgrade handler
server.on("upgrade", (req, socket, head) => {
  // Only accept WS on the correct path
  if (!req.url?.startsWith("/ws")) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wsHub.initialize(wss);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
