// server/src/routes/contacts.routes.ts
// Routes for contact CRUD

import { Router } from "express";
import controller from "../controllers/contactsController";

const router = Router();

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.get);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
