import { Router, Request, Response } from "express";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  res.json({ ok: true, route: "auth/login", message: "stub" });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ ok: true, route: "auth/logout", message: "stub" });
});

export default router;
