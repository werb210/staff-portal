import { Router } from "express";
import contactsRoutes from "./contacts.routes.js";
import tagsRoutes from "./tags.routes.js";
import productsRoutes from "./products.routes.js";
import companiesRoutes from "./companies.routes.js";
import authRoutes from "./auth.routes.js";
import pipelineRoutes from "./pipeline.routes.js";
import messagesRoutes from "./messages.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import chatRoutes from "./chat.routes.js";
import presenceRoutes from "./presence.routes.js";

const router = Router();

router.get("/_int/health", (_req, res) => {
  res.json({
    ok: true,
    service: "staff-portal",
    timestamp: new Date().toISOString(),
  });
});

router.use("/contacts", contactsRoutes);
router.use("/tags", tagsRoutes);
router.use("/products", productsRoutes);
router.use("/companies", companiesRoutes);
router.use("/auth", authRoutes);
router.use("/pipeline", pipelineRoutes);
router.use("/messages", messagesRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/chat", chatRoutes);
router.use("/presence", presenceRoutes);

export default router;
