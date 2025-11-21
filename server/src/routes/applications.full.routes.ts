import { Router } from "express";
import { getFullApplication } from "../controllers/applications.full.controller.js";

const router = Router();

router.get("/:id/full", getFullApplication);

export default router;
