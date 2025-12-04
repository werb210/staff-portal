import { Request, Response, Router } from "express";
import notificationsRepo from "../db/repositories/notifications.repo.js";

const router = Router();

// GET /api/notifications/unread/:userId
router.get("/unread/:userId", async (req: Request, res: Response) => {
  try {
    const result = await notificationsRepo.findUnreadByUser(req.params.userId);
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("notificationsController.unread error:", err);
    res.status(500).json({ success: false, error: "Failed to list notifications" });
  }
});

// POST /api/notifications
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const result = await notificationsRepo.create({
      user_id: body.user_id,
      message: body.message ?? "",
    });
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("notificationsController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create notification" });
  }
});

// POST /api/notifications/:id/read
router.post("/:id/read", async (req: Request, res: Response) => {
  try {
    const result = await notificationsRepo.markRead(req.params.id);
    const record = (result.rows ?? result)[0];
    if (!record) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error("notificationsController.markRead error:", err);
    res.status(500).json({ success: false, error: "Failed to mark notification read" });
  }
});

export default router;
