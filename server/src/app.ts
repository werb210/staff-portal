import express from "express";
import cors from "cors";
import { json, urlencoded } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

export const app = express();

const allowedOrigins = [
  "https://staff.boreal.financial",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000"
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(json({ limit: "25mb" }));
app.use(urlencoded({ extended: true }));

app.use("/api", router);

// global error handler
app.use(errorHandler);
