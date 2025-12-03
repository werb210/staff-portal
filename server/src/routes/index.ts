import { Express } from "express";

import authRoutes from "./auth.routes.js";
import contactsRoutes from "./contacts.routes.js";
import companiesRoutes from "./companies.routes.js";
import productsRoutes from "./products.routes.js";
import tagsRoutes from "./tags.routes.js";
import healthRoutes from "./health.routes.js";

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/contacts", contactsRoutes);
  app.use("/api/companies", companiesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/tags", tagsRoutes);
  app.use("/api/_int", healthRoutes);
};
