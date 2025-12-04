import { Router } from "express";
import tagsController from "../controllers/tagsController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, tagsController.getAll);
router.get("/:id", auth, tagsController.getOne);
router.post("/", auth, tagsController.create);
router.put("/:id", auth, tagsController.update);
router.delete("/:id", auth, tagsController.delete);

export default router;
