import { Router } from "express";

import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import pipelineBoardRoutes from "./pipelineBoard.routes.js";
import notificationsRoutes from "./notifications.routes.js";   // <-- ADD

const router = Router();

router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/pipeline-board", pipelineBoardRoutes);
router.use("/notifications", notificationsRoutes);              // <-- ADD

export default router;
