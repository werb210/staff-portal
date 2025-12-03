import { Router } from "express";
import productsController from "../controllers/productsController";

const router = Router();

router.get("/", productsController.list);
router.get("/:id", productsController.get);
router.post("/", productsController.create);
router.put("/:id", productsController.update);
router.delete("/:id", productsController.remove);

export default router;
