import { Router } from "express";
import pipelineBoardController from "../controllers/pipelineBoardController";

const router = Router();

router.get("/", pipelineBoardController.getBoard);
router.post("/move", pipelineBoardController.moveCard);

export default router;
