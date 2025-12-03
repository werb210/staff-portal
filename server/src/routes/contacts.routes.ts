import { Router } from "express";

const router = Router();

// placeholder route
router.get("/", async (_req, res) => {
  res.json({ message: "contacts endpoint online" });
});

export default router;
