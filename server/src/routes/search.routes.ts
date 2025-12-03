import { Router } from "express";
import searchController from "../controllers/searchController.js";

const router = Router();

// GET /api/search?q=term
router.get("/", searchController.global);

export default router;
