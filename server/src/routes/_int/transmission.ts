import { Router } from "express";
import {
  getTransmissionHistory,
  getRetryQueue,
} from "../../services/transmissionLog";
import { retryJobTick } from "../../jobs/retryQueue";

const router = Router();

/**
 * GET /api/_internal/transmissions/:applicationId
 */
router.get("/transmissions/:applicationId", async (req, res) => {
  const logs = await getTransmissionHistory(req.params.applicationId);
  res.json(logs);
});

/**
 * GET /api/_internal/retry-queue
 */
router.get("/retry-queue", async (req, res) => {
  const items = await getRetryQueue();
  res.json(items);
});

/**
 * POST /api/_internal/retry-queue/run-now
 * Immediately runs the retry loop
 */
router.post("/retry-queue/run-now", async (req, res) => {
  await retryJobTick();
  res.json({ ok: true });
});

export default router;
