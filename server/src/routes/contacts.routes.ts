import { Router } from "express";
import contactsController from "../controllers/contactsController.js";

const router = Router();

// GET /api/contacts
router.get("/", contactsController.list);

// GET /api/contacts/:id
router.get("/:id", contactsController.get);

// POST /api/contacts
router.post("/", contactsController.create);

// PUT /api/contacts/:id
router.put("/:id", contactsController.update);

// DELETE /api/contacts/:id
router.delete("/:id", contactsController.remove);

export default router;
