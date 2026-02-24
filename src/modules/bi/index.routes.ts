import type { Application, Router } from "express";
import { injectSiloContext } from "../../../middleware/siloContext";
import { enforceBISilo } from "../../../middleware/enforceBISilo";

export function registerBIRoutes(app: Application, biRoutes: Router) {
  app.use(injectSiloContext);
  app.use("/api/bi", enforceBISilo, biRoutes);
}
