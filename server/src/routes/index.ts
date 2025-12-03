import { Router } from "express";

// Core feature routers
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import searchRoutes from "./search.routes.js";

// You can add more (auth, health, etc.) here as they are implemented.
// Example (uncomment when files exist):
// import authRoutes from "./auth.routes.js";
// import healthRoutes from "./health.routes.js";

const router = Router();

// Mount feature routes under /api/*
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/search", searchRoutes);

// Example mounts (uncomment when implemented):
// router.use("/auth", authRoutes);
// router.use("/_int", healthRoutes);

export default router;
