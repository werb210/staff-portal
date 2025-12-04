import { Router } from "express";
import { contactsController } from "../controllers/contactsController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, contactsController.list);
router.get("/:id", auth, contactsController.get);
router.post("/", auth, contactsController.create);
router.put("/:id", auth, contactsController.update);
router.delete("/:id", auth, contactsController.remove);

export default router;

