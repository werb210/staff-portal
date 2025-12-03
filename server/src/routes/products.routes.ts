import { Router } from "express";
import productsController from "../controllers/productsController.js";

const router = Router();

router.get("/", productsController.findMany);
router.get("/:id", productsController.findById);
router.post("/", productsController.create);
router.put("/:id", productsController.update);
router.delete("/:id", productsController.remove);

export default router;
