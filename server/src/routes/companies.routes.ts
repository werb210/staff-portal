import { Router } from "express";
import companiesController from "../controllers/companiesController.js";

const router = Router();

router.get("/", companiesController.findMany);
router.get("/:id", companiesController.findById);
router.post("/", companiesController.create);
router.put("/:id", companiesController.update);
router.delete("/:id", companiesController.remove);

export default router;
