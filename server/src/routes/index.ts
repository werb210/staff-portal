import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import companiesRoutes from "./companies.routes.js";
import contactsRoutes from "./contacts.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import searchRoutes from "./search.js";
import notificationsRoutes from "./notifications.js";
import auditViewerRoutes from "./auditViewer.js";
import roleManagementRoutes from "./roleManagement.routes.js";
import pipelineRoutes from "./pipeline.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/contacts", contactsRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/search", searchRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/audit", auditViewerRoutes);
router.use("/roles", roleManagementRoutes);
router.use("/pipeline", pipelineRoutes);

export default router;
