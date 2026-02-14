import { Router, type Request, type Response } from "express";

const router = Router();

router.post("/ai/voice/token", async (_req: Request, res: Response) => {
  res.json({ token: "voice-ready-placeholder" });
});

export default router;
