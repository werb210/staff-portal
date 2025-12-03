import { Router } from "express";

const router = Router();

// Internal health check
router.get("/_int/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "staff-portal-backend",
    timestamp: new Date().toISOString(),
  });
});

export default router;
