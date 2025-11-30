import { Router } from "express";
import { startSigning, processSignNowCallback } from "../services/signnow.js";

const router = Router();

/**
 * POST /signing/start/:applicationId
 * Start a new signing session
 */
router.post("/start/:applicationId", async (req, res) => {
  try {
    const { inviteUrl } = await startSigning(req.params.applicationId);
    res.json({ inviteUrl });
  } catch (err: any) {
    console.error("❌ SIGNING START ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /signing/callback
 * SignNow webhook delivers this
 */
router.post("/callback", async (req, res) => {
  try {
    await processSignNowCallback(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("❌ SIGNNOW CALLBACK ERROR:", err);
    res.json({ ok: false });
  }
});

export default router;
