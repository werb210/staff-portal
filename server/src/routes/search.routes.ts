import { Router } from "express";
import searchController from "../controllers/searchController";

const router = Router();

// GET /api/search?q=abc
router.get("/", searchController.globalSearch);

export default router;
