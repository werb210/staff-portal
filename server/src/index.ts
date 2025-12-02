import express from "express";
import searchRoutes from "./routes/search.js";

const app = express();

app.use("/api/search", searchRoutes);

export default app;
