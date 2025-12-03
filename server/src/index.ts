import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import routes from "./routes/index";
import { initSocketServer } from "./realtime/socketServer.js";

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api", routes);

// Simple root route (optional)
app.get("/", (_req, res) => {
  res.status(200).send("Boreal Staff Portal API");
});

// Serve frontend build (if/when wired)
const FRONTEND_BUILD_DIR = path.join(process.cwd(), "dist");
app.use(express.static(FRONTEND_BUILD_DIR));

app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_DIR, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Not Found");
    }
  });
});

const server = http.createServer(app);

// Start WebSocket server
initSocketServer(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Staff Portal backend listening on port ${PORT}`);
});
