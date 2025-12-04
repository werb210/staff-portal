import { Request, Response, Router } from "express";
import dealsRepo from "../db/repositories/deals.repo.js";

const router = Router();

// GET /api/deals
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await dealsRepo.findAll();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("dealsController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list deals" });
  }
});

// GET /api/deals/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await dealsRepo.findById(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("dealsController.get error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch deal" });
  }
});

// POST /api/deals
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await dealsRepo.create(req.body ?? {});
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("dealsController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create deal" });
  }
});

// PUT /api/deals/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const result = await dealsRepo.update(req.params.id, req.body ?? {});
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("dealsController.update error:", err);
    res.status(500).json({ success: false, error: "Failed to update deal" });
  }
});

// DELETE /api/deals/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await dealsRepo.delete(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: { id: record.id } });
  } catch (err: any) {
    console.error("dealsController.delete error:", err);
    res.status(500).json({ success: false, error: "Failed to delete deal" });
  }
});

export default router;
