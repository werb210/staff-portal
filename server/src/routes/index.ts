// server/src/routes/index.ts
// Central router aggregator for the staff-portal backend (TypeScript version)

import { Router } from "express";

import authRoutes from "./auth.routes";
import contactsRoutes from "./contacts.routes";
import companiesRoutes from "./companies.routes";
import productsRoutes from "./products.routes";
import tagsRoutes from "./tags.routes";
import healthRoutes from "./health.routes";

const router = Router();

// Public / health
router.use("/health", healthRoutes);

// Core modules
router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);

export default router;
