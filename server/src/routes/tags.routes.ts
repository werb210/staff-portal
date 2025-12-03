import { Router } from "express";
import tagsController from "../controllers/tagsController.js";

const router = Router();

router.get("/", tagsController.list);
router.post("/", tagsController.create);
router.delete("/:id", tagsController.delete);

export default router;
