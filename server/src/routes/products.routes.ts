import { Router } from "express";
import productsController from "../controllers/productsController.js";

const router = Router();

router.get("/", productsController.list);
router.get("/:id", productsController.get);
router.post("/", productsController.create);
router.put("/:id", productsController.update);

export default router;
