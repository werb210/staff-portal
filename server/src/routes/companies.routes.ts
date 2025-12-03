import { Router } from "express";
import companiesController from "../controllers/companiesController.js";

const router = Router();

router.get("/", companiesController.list);
router.get("/:id", companiesController.get);
router.post("/", companiesController.create);
router.put("/:id", companiesController.update);

export default router;
