import { Router } from "express";
import authRoutes from "./auth.routes.js";
import tagsRoutes from "./tags.routes.js";
import companiesRoutes from "./companies.routes.js";
import contactsRoutes from "./contacts.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tags", tagsRoutes);
router.use("/companies", companiesRoutes);
router.use("/contacts", contactsRoutes);

// internal health
router.get("/_int/health", (req, res) =>
  res.json({ success: true, status: "ok" })
);

export default router;

