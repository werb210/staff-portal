import { Router } from "express";
import { tagsController } from "../controllers/tagsController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, tagsController.list);
router.post("/", auth, tagsController.create);
router.put("/:id", auth, tagsController.update);
router.delete("/:id", auth, tagsController.remove);

export default router;

