import { Router } from "express";
import contactsController from "../controllers/contactsController.js";

const router = Router();

router.get("/", contactsController.findMany);
router.get("/:id", contactsController.findById);
router.post("/", contactsController.create);
router.put("/:id", contactsController.update);
router.delete("/:id", contactsController.remove);

export default router;
