import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";

const app = express();

// Required for ESM resolution in Azure
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use("/api", routes);

// Simple health route
app.get("/api/_int/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Required for Azure App Service startup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Staff API running on port ${PORT}`);
});

export default app;
