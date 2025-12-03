import { Router } from "express";
import { emailController } from "../controllers/emailController.js";

const router = Router();

router.get("/", emailController.list);
router.get("/contact/:contactId", emailController.listByContact);
router.post("/send", emailController.send);
router.get("/:id", emailController.get);

export default router;
