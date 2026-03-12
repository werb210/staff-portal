import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "https://staff.boreal.financial",
  "https://client.boreal.financial",
  "https://boreal.financial",
  "https://www.boreal.financial"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

export default app;
