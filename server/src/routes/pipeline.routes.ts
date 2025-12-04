import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, route: "pipeline", message: "stub" });
});

export default router;
