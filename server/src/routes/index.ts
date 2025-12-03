import { Router } from "express";

import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import lendersRoutes from "./lenders.routes.js";
import applicationsRoutes from "./applications.routes.js";
import tagsRoutes from "./tags.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/contacts", contactsRoutes);
router.use("/companies", companiesRoutes);
router.use("/products", productsRoutes);
router.use("/lenders", lendersRoutes);
router.use("/applications", applicationsRoutes);
router.use("/tags", tagsRoutes);

export default router;
