import { Router } from "express";
import contactsController from "../controllers/contactsController";

const router = Router();

// list
router.get("/", contactsController.list);

// search: GET /api/contacts/search?q=alex
router.get("/search", contactsController.search);

// CRUD
router.get("/:id", contactsController.get);
router.post("/", contactsController.create);
router.put("/:id", contactsController.update);
router.delete("/:id", contactsController.remove);

export default router;
