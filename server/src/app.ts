import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

export const createApp = () => {
  const app = express();

  // core middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(helmet());
  app.use(morgan("dev"));

  // placeholder routes root
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "Staff Portal Backend Running" });
  });

  // health route
  app.get("/api/_int/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

