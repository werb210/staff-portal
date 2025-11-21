import { Router } from "express";
import { getPagedApplications } from "../controllers/applications.paged.controller.js";

const router = Router();

router.get("/", getPagedApplications);

export default router;
