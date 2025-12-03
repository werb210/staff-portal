import { Router } from "express";
import pipelineEventsController from "../controllers/pipelineEventsController";

const router = Router();

router.get("/application/:id", pipelineEventsController.listByApplication);
router.post("/", pipelineEventsController.create);

export default router;
