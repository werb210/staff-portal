import { Router } from "express";
import contactsController from "../controllers/contactsController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, contactsController.getAll);
router.get("/:id", auth, contactsController.getOne);
router.post("/", auth, contactsController.create);
router.put("/:id", auth, contactsController.update);
router.delete("/:id", auth, contactsController.delete);

export default router;
