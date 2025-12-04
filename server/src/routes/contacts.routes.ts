import { Router } from "express";
import contactsController from "../controllers/contactsController.js";

const router = Router();

router.get("/", contactsController.getAll);
router.get("/:id", contactsController.getOne);
router.post("/", contactsController.create);
router.put("/:id", contactsController.update);
router.delete("/:id", contactsController.delete);

export default router;
