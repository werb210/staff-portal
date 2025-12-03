import { Router } from "express";

import contactsRoutes from "./contacts.routes";
import companiesRoutes from "./companies.routes";
import productsRoutes from "./products.routes";
import tagsRoutes from "./tags.routes";

const router = Router();

router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);

router.get("/_int/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

export default router;
