import express from "express";
import searchRoutes from "./routes/search.js";
import notificationsRoutes from "./routes/notifications.js";

const app = express();

app.use(express.json());

app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationsRoutes);

export default app;
