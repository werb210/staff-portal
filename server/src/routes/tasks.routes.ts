import { Router } from "express";
import tasksController from "../controllers/tasksController.js";

const router = Router();

router.get("/", tasksController.getAll);
router.get("/:id", tasksController.getOne);
router.post("/", tasksController.create);
router.put("/:id", tasksController.update);
router.delete("/:id", tasksController.delete);

export default router;
