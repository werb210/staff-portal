import { Router, Request, Response } from "express";

const router = Router();

// Temporary stub routes until real logic is added
router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, route: "contacts", message: "stub" });
});

router.get("/:id", (req: Request, res: Response) => {
  res.json({ ok: true, route: "contacts", id: req.params.id, message: "stub" });
});

export default router;
