import express from "express";
import cors from "cors";
import helmet from "helmet";

import requestLogger from "./middleware/requestLogger.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

import routes from "./routes/index.js";

const app = express();

// --- core middleware ---
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(requestLogger);

// --- routes ---
app.use("/api", routes);

// --- 404 ---
app.use(notFound);

// --- global error handler ---
app.use(errorHandler);

export default app;
