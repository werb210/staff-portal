import { Router } from "express";

import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import applicationsRoutes from "./applications.routes.js";
import documentsRoutes from "./documents.routes.js";
import timelineRoutes from "./timeline.routes.js";
import messagesRoutes from "./messages.routes.js";
import notificationsRoutes from "./notifications.routes.js";   // <-- NEW
import tagsRoutes from "./tags.routes.js";
import usersRoutes from "./users.routes.js";
import productsRoutes from "./products.routes.js";
import lendersRoutes from "./lenders.routes.js";

const router = Router();

router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/applications", applicationsRoutes);
router.use("/documents", documentsRoutes);
router.use("/timeline", timelineRoutes);
router.use("/messages", messagesRoutes);
router.use("/notifications", notificationsRoutes);   // <-- NEW MOUNT
router.use("/tags", tagsRoutes);
router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
router.use("/lenders", lendersRoutes);

export default router;
