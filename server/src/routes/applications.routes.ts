import { Router } from "express";
import applicationsController from "../controllers/applicationsController.js";

const router = Router();

router.get("/", applicationsController.list);
router.get("/:id", applicationsController.get);
router.post("/", applicationsController.create);
router.put("/:id", applicationsController.update);

export default router;
