import { Router } from "express";
import app from "../app.js";
import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);
router.use("/_int", healthRoutes);

app.use("/api", router);

export default router;
