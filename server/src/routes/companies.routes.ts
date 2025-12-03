// server/src/routes/companies.routes.ts
import { Router } from "express";
import CompaniesController from "../controllers/companiesController";

const router = Router();

router.get("/", CompaniesController.list);
router.get("/:id", CompaniesController.get);
router.post("/", CompaniesController.create);
router.put("/:id", CompaniesController.update);
router.delete("/:id", CompaniesController.delete);

export default router;
