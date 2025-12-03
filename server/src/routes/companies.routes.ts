import { Router } from "express";
import companiesController from "../controllers/companiesController";

const router = Router();

// list
router.get("/", companiesController.list);

// search
router.get("/search", companiesController.search);

// CRUD
router.get("/:id", companiesController.get);
router.post("/", companiesController.create);
router.put("/:id", companiesController.update);
router.delete("/:id", companiesController.remove);

// linked contacts
router.get("/:id/contacts", companiesController.contacts);

export default router;
