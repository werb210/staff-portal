import { Router } from "express";

const router = Router();

// placeholder route
router.get("/", async (_req, res) => {
  res.json({ message: "companies endpoint online" });
});

export default router;
