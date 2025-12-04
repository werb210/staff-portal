import { Router } from "express";
import usersController from "../controllers/usersController.js";

const router = Router();

router.get("/", usersController.getAll);
router.get("/:id", usersController.getOne);
router.post("/", usersController.create);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.delete);

export default router;
