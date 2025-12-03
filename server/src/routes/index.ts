import { Router } from "express";

const router = Router();

// Codex: leave empty for now. Valid placeholder.
// More routes will be wired in Blocks 3+.

router.get("/health", (req, res) => res.json({ ok: true }));

export default router;
