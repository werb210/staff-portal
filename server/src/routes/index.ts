import { Router } from "express";

import companiesRoutes from "./companies.routes.js";
import contactsRoutes from "./contacts.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

// Health check
router.get("/_int/health", (_req, res) => {
  res.json({ status: "ok", service: "staff-portal" });
});

// Mount submodules
router.use("/companies", companiesRoutes);
router.use("/contacts", contactsRoutes);
router.use("/auth", authRoutes);

export default router;
