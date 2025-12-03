import { Router } from "express";
import lendersController from "../controllers/lendersController.js";

const router = Router();

router.get("/", lendersController.list);
router.get("/:id", lendersController.get);
router.post("/", lendersController.create);
router.put("/:id", lendersController.update);

export default router;
