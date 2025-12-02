import { Router } from "express";
import { auditViewerController } from "../controllers/auditViewerController.js";
import requireAuth from "../middleware/requireAuth.js";

const r = Router();

r.use(requireAuth);
r.get("/search", auditViewerController.search);

export default r;
