import express from "express";
import searchRoutes from "./routes/search.js";
import notificationsRoutes from "./routes/notifications.js";
import auditViewerRoutes from "./routes/auditViewer.js";
import roleManagementRoutes from "./routes/roleManagement.routes.js";

const app = express();

app.use(express.json());

app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/audit", auditViewerRoutes);
app.use("/api/roles", roleManagementRoutes);

export default app;
