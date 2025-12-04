import { Request, Response, Router } from "express";
import tasksRepo from "../db/repositories/tasks.repo.js";

const router = Router();

// GET /api/tasks
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await tasksRepo.findAll();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("tasksController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list tasks" });
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await tasksRepo.findById(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("tasksController.get error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch task" });
  }
});

// POST /api/tasks
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await tasksRepo.create(req.body ?? {});
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("tasksController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const result = await tasksRepo.update(req.params.id, req.body ?? {});
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("tasksController.update error:", err);
    res.status(500).json({ success: false, error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await tasksRepo.delete(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: { id: record.id } });
  } catch (err: any) {
    console.error("tasksController.delete error:", err);
    res.status(500).json({ success: false, error: "Failed to delete task" });
  }
});

export default router;
