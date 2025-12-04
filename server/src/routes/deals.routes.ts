import { Router } from "express";
import dealsController from "../controllers/dealsController.js";

const router = Router();

router.get("/", dealsController.getAll);
router.get("/:id", dealsController.getOne);
router.post("/", dealsController.create);
router.put("/:id", dealsController.update);
router.delete("/:id", dealsController.delete);

export default router;
