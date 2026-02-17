import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_HTML = path.join(DIST_DIR, "index.html");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(express.static(DIST_DIR));
app.get("*", (_req, res) => {
  res.sendFile(INDEX_HTML);
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});
