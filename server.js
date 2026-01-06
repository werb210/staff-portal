// Minimal static file server for Azure App Service (Linux Node).
// Serves the Vite build output from ./dist with SPA fallback to index.html.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_HTML = path.join(DIST_DIR, "index.html");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function sendFile(res, filePath, statusCode = 200) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    const data = fs.readFileSync(filePath);
    res.writeHead(statusCode, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
}

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = decoded.replace(/\\/g, "/");
  const rel = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;
  const abs = path.join(DIST_DIR, rel);
  if (!abs.startsWith(DIST_DIR)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  // Health check
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("dist/ not found. Build output missing.");
    return;
  }

  const filePath = safeResolve(req.url || "/");
  if (!filePath) {
    sendFile(res, INDEX_HTML, 200);
    return;
  }

  // If it’s a real file, serve it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath, 200);
    return;
  }

  // SPA fallback
  sendFile(res, INDEX_HTML, 200);
});

const PORT = Number(process.env.PORT || 8080);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Static server running on port ${PORT}`);
});
