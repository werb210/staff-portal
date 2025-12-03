import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes/index";

const app = express();

// basic middleware
app.use(cors());
app.use(bodyParser.json());

// mount all API routes under /api
app.use("/api", routes);

// simple health endpoint for local checks
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`[staff-portal] API listening on port ${PORT}`);
  });
}

export default app;
