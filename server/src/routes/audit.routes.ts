import { Router } from "express";
import { auditController } from "../controllers/auditController.js";

const router = Router();

router.get("/entity/:entity/:entityId", auditController.getForEntity);
router.get("/user/:userId", auditController.getForUser);

export default router;
