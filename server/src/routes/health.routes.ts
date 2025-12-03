import { Router } from "express";
import healthController from "../controllers/healthController.js";

const router = Router();

// GET /api/_int/health
router.get("/health", healthController.basic);

export default router;
