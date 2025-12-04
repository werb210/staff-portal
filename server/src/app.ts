import express from "express";
import cors from "cors";
import { json, urlencoded } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

export const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(json({ limit: "25mb" }));
app.use(urlencoded({ extended: true }));

app.use("/api", router);

// global error handler
app.use(errorHandler);

