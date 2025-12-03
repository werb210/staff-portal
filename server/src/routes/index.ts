import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import companiesRoutes from "./companies.routes.js";
import contactsRoutes from "./contacts.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/contacts", contactsRoutes);
router.use("/products", productsRoutes);
router.use("/tags", tagsRoutes);

export default router;
