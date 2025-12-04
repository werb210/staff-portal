import { Request, Response, Router } from "express";
import usersRepo from "../db/repositories/users.repo.js";

const router = Router();

// GET /api/users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await usersRepo.findAll();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("usersController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list users" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await usersRepo.findById(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("usersController.get error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

export default router;
