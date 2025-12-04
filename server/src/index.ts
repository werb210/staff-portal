// server/src/index.ts
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// basic root route
app.get("/", (_req, res) => {
  res.status(200).send("Staff Portal API running");
});

// mount API routes
app.use("/api", routes);

// fallback
app.use("*", (_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Staff portal API listening on port ${PORT}`);
});
