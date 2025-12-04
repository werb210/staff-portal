// server/src/routes/index.ts
import { Router, Request, Response } from "express";

// Import sub-routers as they exist in this repo.
// If any of these files do not exist yet, comment that line out
// (or create the route file in a later block).
import contactsRoutes from "./contacts.routes.js";
import tagsRoutes from "./tags.routes.js";
import productsRoutes from "./products.routes.js";
// Add more as they come online:
// import companiesRoutes from "./companies.routes.js";
// import authRoutes from "./auth.routes.js";
// import pipelineRoutes from "./pipeline.routes.js";

const router = Router();

/**
 * Internal health endpoint — for your curl smoke tests.
 * Will be mounted under /api/_int/health by server/src/index.ts
 * (if index.ts uses app.use("/api", router)).
 */
router.get("/_int/health", (req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "staff-portal",
    timestamp: new Date().toISOString(),
  });
});

// Public/CRM API routes
router.use("/contacts", contactsRoutes);
router.use("/tags", tagsRoutes);
router.use("/products", productsRoutes);

// Placeholder for future routes:
// router.use("/companies", companiesRoutes);
// router.use("/auth", authRoutes);
// router.use("/pipeline", pipelineRoutes);

export default router;
