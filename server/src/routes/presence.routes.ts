import { Router } from "express";
import { getAllPresence, getPresence } from "../realtime/presenceStore.js";

const router = Router();

router.get("/all", (_req, res) => {
  res.json({ success: true, presence: getAllPresence() });
});

router.get("/:userId", (req, res) => {
  const p = getPresence(req.params.userId);
  res.json({ success: true, presence: p });
});

export default router;
