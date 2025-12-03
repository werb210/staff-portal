import { Router } from "express";

import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import lendersRoutes from "./lenders.routes.js";
import applicationsRoutes from "./applications.routes.js";
import documentsRoutes from "./documents.routes.js";
import pipelineRoutes from "./pipeline.routes.js";
import ocrRoutes from "./ocr.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import usersRoutes from "./users.routes.js";
import searchRoutes from "./search.routes.js";
import auditRoutes from "./audit.routes.js";
import tagsRoutes from "./tags.routes.js";
import financialsRoutes from "./financialsRoutes.js";
import bankingRoutes from "./banking.js";
import signingRoutes from "./signing.js";

const router = Router();

// Authentication
router.use("/auth", authRoutes);

// Core CRM Entities
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/lenders", lendersRoutes);

// Applications + Pipeline
router.use("/applications", applicationsRoutes);
router.use("/documents", documentsRoutes);
router.use("/pipeline", pipelineRoutes);

// AI / OCR / Banking Analysis
router.use("/ocr", ocrRoutes);
router.use("/banking", bankingRoutes);

// Notifications, Tags, Search, Users
router.use("/notifications", notificationsRoutes);
router.use("/tags", tagsRoutes);
router.use("/search", searchRoutes);
router.use("/users", usersRoutes);

// Financials & Signing
router.use("/financials", financialsRoutes);
router.use("/signing", signingRoutes);

// Fallback
router.get("/", (_req, res) => {
  res.status(200).json({ message: "API router online" });
});

export default router;
