import { Router } from "express";
import { notificationsRepo } from "../db/repositories/notifications.repo.js";

const router = Router();

/**
 * GET /api/notifications
 * Returns all notifications
 */
router.get("/", async (req, res) => {
  try {
    const rows = await notificationsRepo.getAll();
    res.json(rows);
  } catch (err: any) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * GET /api/notifications/:id
 * Return a single notification by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const row = await notificationsRepo.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err: any) {
    console.error("GET /notifications/:id error:", err);
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

/**
 * POST /api/notifications
 * Create new notification
 */
router.post("/", async (req, res) => {
  try {
    const row = await notificationsRepo.create(req.body);
    res.status(201).json(row);
  } catch (err: any) {
    console.error("POST /notifications error:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/**
 * PUT /api/notifications/:id
 * Update existing notification
 */
router.put("/:id", async (req, res) => {
  try {
    const row = await notificationsRepo.update(req.params.id, req.body);
    res.json(row);
  } catch (err: any) {
    console.error("PUT /notifications/:id error:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
