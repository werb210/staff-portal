import { Request, Response, Router } from "express";
import messagesRepo from "../db/repositories/messages.repo.js";

const router = Router();

// GET /api/contacts/:contactId/messages
router.get("/contact/:contactId", async (req: Request, res: Response) => {
  try {
    const result = await messagesRepo.findAllByContact(req.params.contactId);
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("messagesController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to list messages" });
  }
});

// POST /api/contacts/:contactId/messages
router.post("/contact/:contactId", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const payload = {
      contact_id: req.params.contactId,
      sender: body.sender ?? "staff",
      body: body.body ?? "",
    };
    const result = await messagesRepo.create(payload);
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("messagesController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create message" });
  }
});

export default router;
