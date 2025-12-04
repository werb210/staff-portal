import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());

// Mount API
app.use("/api", router);

// Basic health endpoint
app.get("/api/_int/health", (req, res) => {
  res.json({ ok: true, service: "staff-portal-api" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Staff Portal API running on port", PORT);
});
