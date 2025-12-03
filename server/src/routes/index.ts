import { Router } from "express";

import authRoutes from "./auth.routes";
import contactsRoutes from "./contacts.routes";
import companiesRoutes from "./companies.routes";
import productsRoutes from "./products.routes";
import tagsRoutes from "./tags.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/health", healthRoutes);

export default router;
