import { Router } from "express";
import { notificationsController } from "../controllers/notificationsController.js";
import requireAuth from "../middleware/requireAuth.js";

const r = Router();
r.use(requireAuth);

r.get("/", notificationsController.list);
r.post("/:id/read", notificationsController.markRead);

export default r;
