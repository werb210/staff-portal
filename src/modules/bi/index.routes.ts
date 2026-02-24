import type { Application } from "express";
import { injectSiloContext } from "../../../middleware/siloContext";
import { setCurrentSilo } from "../../../middleware/setCurrentSilo";
import biDashboard from "../../../routes/biDashboard";
import biRevenue from "../../../routes/biRevenue";

export function registerBIRoutes(app: Application) {
  app.use(injectSiloContext);
  app.use(setCurrentSilo);
  app.use(biDashboard);
  app.use(biRevenue);
}
