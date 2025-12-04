import { Request, Response, Router } from "express";
import tagsRepo from "../db/repositories/tags.repo.js";

const router = Router();

// GET /api/tags
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await tagsRepo.findAll();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("tagsController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list tags" });
  }
});

// POST /api/tags
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body ?? {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, error: "Missing 'name'" });
    }
    const result = await tagsRepo.create(name);
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("tagsController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create tag" });
  }
});

// PUT /api/tags/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name } = req.body ?? {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, error: "Missing 'name'" });
    }
    const result = await tagsRepo.update(req.params.id, name);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("tagsController.update error:", err);
    res.status(500).json({ success: false, error: "Failed to update tag" });
  }
});

// DELETE /api/tags/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await tagsRepo.delete(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: { id: record.id } });
  } catch (err: any) {
    console.error("tagsController.delete error:", err);
    res.status(500).json({ success: false, error: "Failed to delete tag" });
  }
});

export default router;
