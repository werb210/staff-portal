import { Router } from "express";
import companiesController from "../controllers/companiesController.js";

const router = Router();

router.get("/", companiesController.getAll);
router.get("/:id", companiesController.getOne);
router.post("/", companiesController.create);
router.put("/:id", companiesController.update);
router.delete("/:id", companiesController.delete);

export default router;
