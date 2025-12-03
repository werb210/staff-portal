import { Router } from "express";
import tagsController from "../controllers/tagsController";

const router = Router();

router.get("/", tagsController.list);
router.post("/", tagsController.create);
router.put("/:id", tagsController.update);
router.delete("/:id", tagsController.remove);

router.post("/attach", tagsController.attach);
router.post("/detach", tagsController.detach);
router.get("/app/:applicationId", tagsController.getForApp);

export default router;
