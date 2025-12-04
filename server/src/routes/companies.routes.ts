import { Router } from "express";
import companiesController from "../controllers/companiesController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, companiesController.getAll);
router.get("/:id", auth, companiesController.getOne);
router.post("/", auth, companiesController.create);
router.put("/:id", auth, companiesController.update);
router.delete("/:id", auth, companiesController.delete);

export default router;
