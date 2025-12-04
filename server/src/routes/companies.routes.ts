import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, route: "companies", message: "stub" });
});

router.get("/:id", (req: Request, res: Response) => {
  res.json({ ok: true, route: "companies", id: req.params.id, message: "stub" });
});

export default router;
