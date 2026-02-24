import type { Application } from "express";
import { injectSiloContext } from "../../../middleware/siloContext";
import { setSiloSession } from "../../../middleware/setSiloSession";
import biDashboard from "../../../routes/biDashboard";
import biRevenue from "../../../routes/biRevenue";

export function registerBIRoutes(app: Application) {
  app.use(injectSiloContext);
  app.use(setSiloSession);
  app.use(biDashboard);
  app.use(biRevenue);
}
