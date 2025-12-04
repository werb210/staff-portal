import { Router } from "express";
import { companiesController } from "../controllers/companiesController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, companiesController.list);
router.get("/:id", auth, companiesController.get);
router.post("/", auth, companiesController.create);
router.put("/:id", auth, companiesController.update);
router.delete("/:id", auth, companiesController.remove);

export default router;

