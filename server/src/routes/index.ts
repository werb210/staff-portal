import { Router } from "express";

import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";

const router = Router();

// --------------------------
// API ROUTES
// --------------------------
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);

// --------------------------
// DEFAULT FALLBACK
// --------------------------
router.get("/_int/health", (_req, res) => {
  res.json({ ok: true, service: "staff-portal-backend" });
});

export default router;
