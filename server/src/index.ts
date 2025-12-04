import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Mount API router
app.use("/api", router);

// Root ping (optional)
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "staff-portal" });
});

// Port for local dev
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(PORT, () => {
  console.log(`Staff-portal API listening on port ${PORT}`);
});
