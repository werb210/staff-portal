import { Request, Response, Router } from "express";
import contactsRepo from "../db/repositories/contacts.repo.js";

const router = Router();

// GET /api/contacts
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await contactsRepo.findAll();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("contactsController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list contacts" });
  }
});

// GET /api/contacts/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await contactsRepo.findById(id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("contactsController.get error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch contact" });
  }
});

// POST /api/contacts
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await contactsRepo.create(req.body ?? {});
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("contactsController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create contact" });
  }
});

// PUT /api/contacts/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await contactsRepo.update(id, req.body ?? {});
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("contactsController.update error:", err);
    res.status(500).json({ success: false, error: "Failed to update contact" });
  }
});

// DELETE /api/contacts/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await contactsRepo.delete(id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: { id: record.id } });
  } catch (err: any) {
    console.error("contactsController.delete error:", err);
    res.status(500).json({ success: false, error: "Failed to delete contact" });
  }
});

export default router;
