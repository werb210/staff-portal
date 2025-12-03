// --- DISABLE APPLICATION INSIGHTS (Azure iKey bug) ---
try {
  delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  delete process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
} catch {}
// ------------------------------------------------------

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { registerRoutes } from "./routes/index.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
registerRoutes(app);

app.get("/api/_int/health", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("Staff Server Running"));

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log("Server running on " + port));
}

export default app;
