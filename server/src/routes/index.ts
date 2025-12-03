import { Router } from "express";

import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import messagesRoutes from "./messages.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import searchRoutes from "./search.routes.js";
import healthRoutes from "./health.routes.js";
import usersRoutes from "./users.routes.js";

const router = Router();

// Feature routes
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/messages", messagesRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/search", searchRoutes);
router.use("/users", usersRoutes);

// Internal health check
router.use("/_int", healthRoutes);

export default router;
