import { Router } from "express";

import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import pipelineBoardRoutes from "./pipelineBoard.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import auditRoutes from "./audit.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/pipeline-board", pipelineBoardRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/audit", auditRoutes);

export default router;
