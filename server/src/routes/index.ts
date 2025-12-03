import { Router } from "express";

import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import searchRoutes from "./search.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

// Feature routes
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/search", searchRoutes);

// Internal health check
router.use("/_int", healthRoutes);

export default router;
