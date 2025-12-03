import { Router } from "express";

import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import pipelineRoutes from "./pipeline.js";
import notificationsRoutes from "./notifications.js";
import usersRoutes from "./users.routes.js";
import searchRoutes from "./search.js";
import tagsRoutes from "./tags.routes.js";
import roleManagementRoutes from "./roleManagement.routes.js";
import auditViewerRoutes from "./auditViewer.js";

const router = Router();

// Authentication
router.use("/auth", authRoutes);

// Core CRM Entities
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);

// Applications + Pipeline
router.use("/pipeline", pipelineRoutes);

// Notifications, Tags, Search, Users
router.use("/notifications", notificationsRoutes);
router.use("/tags", tagsRoutes);
router.use("/search", searchRoutes);
router.use("/users", usersRoutes);
router.use("/roles", roleManagementRoutes);
router.use("/audit-viewer", auditViewerRoutes);

// Fallback
router.get("/", (_req, res) => {
  res.status(200).json({ message: "API router online" });
});

export default router;
