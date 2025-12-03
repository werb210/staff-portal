import { Router } from "express";

const router = Router();

// placeholder login route
router.post("/login", async (_req, res) => {
  res.json({ message: "login endpoint online" });
});

export default router;
