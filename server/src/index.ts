import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from "path";

// Azure container sanity check logging
console.log("=== Staff-Server starting ===");

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(cors());
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Root route for Azure health checks
app.get("/", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Staff API is running" });
});

// Health endpoint for App Service
app.get("/health", (_req, res) => {
  res.status(200).json({ healthy: true });
});

// Mount API routes
app.use("/api", routes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Generic error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Azure exposes PORT env automatically
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Staff API running on port ${PORT}`);
});

