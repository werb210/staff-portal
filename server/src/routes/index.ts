import { Router } from "express";

import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import applicationsRoutes from "./applications.routes.js";
import documentsRoutes from "./documents.routes.js";
import timelineRoutes from "./timeline.routes.js";
import messagesRoutes from "./messages.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import tagsRoutes from "./tags.routes.js";
import usersRoutes from "./users.routes.js";
import productsRoutes from "./products.routes.js";
import lendersRoutes from "./lenders.routes.js";
import emailLogsRoutes from "./emailLogs.routes.js";
import smsLogsRoutes from "./smsLogs.routes.js";
import chatRoutes from "./chat.routes.js";

const router = Router();

router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/applications", applicationsRoutes);
router.use("/documents", documentsRoutes);
router.use("/timeline", timelineRoutes);
router.use("/messages", messagesRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/tags", tagsRoutes);
router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
router.use("/lenders", lendersRoutes);
router.use("/email-logs", emailLogsRoutes);
router.use("/sms-logs", smsLogsRoutes);
router.use("/chat", chatRoutes);

export default router;
import searchRoutes from "./search.routes";

router.use("/search", searchRoutes);

import contactsRoutes from "./contacts.routes";
router.use("/contacts", contactsRoutes);
