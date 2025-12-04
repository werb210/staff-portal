import { Request, Response, Router } from "express";
import companiesRepo from "../db/repositories/companies.repo.js";

const router = Router();

// GET /api/companies
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await companiesRepo.findAll();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("companiesController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list companies" });
  }
});

// GET /api/companies/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await companiesRepo.findById(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("companiesController.get error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch company" });
  }
});

// POST /api/companies
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await companiesRepo.create(req.body ?? {});
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("companiesController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create company" });
  }
});

// PUT /api/companies/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const result = await companiesRepo.update(req.params.id, req.body ?? {});
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("companiesController.update error:", err);
    res.status(500).json({ success: false, error: "Failed to update company" });
  }
});

// DELETE /api/companies/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await companiesRepo.delete(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: { id: record.id } });
  } catch (err: any) {
    console.error("companiesController.delete error:", err);
    res.status(500).json({ success: false, error: "Failed to delete company" });
  }
});

export default router;
