import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import searchService from "../services/searchService.js";

const router = Router();

// Internal health check
router.get("/_int/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "staff-portal-backend",
    timestamp: new Date().toISOString(),
  });
});

router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const q = (req.query.q ?? "") as string;
    const data = await searchService.globalSearch(q);
    res.status(200).json({ success: true, data });
  })
);

export default router;
