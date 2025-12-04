import { Router } from "express";
import tagsController from "../controllers/tagsController.js";

const router = Router();

router.get("/", tagsController.getAll);
router.get("/:id", tagsController.getOne);
router.post("/", tagsController.create);
router.put("/:id", tagsController.update);
router.delete("/:id", tagsController.delete);

export default router;
