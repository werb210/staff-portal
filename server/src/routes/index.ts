import { Router } from "express";

import contactsController from "../controllers/contactsController";
import companiesController from "../controllers/companiesController";
import productsController from "../controllers/productsController";
import tagController from "../controllers/tagController";

const router = Router();

// Internal health check
router.get("/_int/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "staff-portal-backend",
    timestamp: new Date().toISOString(),
  });
});

// Contacts CRUD
router.get("/contacts", contactsController.list);
router.get("/contacts/:id", contactsController.get);
router.post("/contacts", contactsController.create);
router.put("/contacts/:id", contactsController.update);
router.delete("/contacts/:id", contactsController.remove);

// Companies CRUD
router.get("/companies", companiesController.list);
router.get("/companies/:id", companiesController.get);
router.post("/companies", companiesController.create);
router.put("/companies/:id", companiesController.update);
router.delete("/companies/:id", companiesController.remove);

// Products CRUD
router.get("/products", productsController.list);
router.get("/products/:id", productsController.get);
router.post("/products", productsController.create);
router.put("/products/:id", productsController.update);
router.delete("/products/:id", productsController.remove);

// Tags CRUD
router.get("/tags", tagController.list);
router.post("/tags", tagController.create);
router.put("/tags/:id", tagController.update);
router.delete("/tags/:id", tagController.remove);

export default router;
