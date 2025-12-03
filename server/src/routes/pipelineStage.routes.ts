import { Router } from "express";
import pipelineStageController from "../controllers/pipelineStageController";

const router = Router();

router.get("/", pipelineStageController.list);
router.get("/:id", pipelineStageController.get);
router.post("/", pipelineStageController.create);
router.put("/:id", pipelineStageController.update);
router.delete("/:id", pipelineStageController.remove);

export default router;
