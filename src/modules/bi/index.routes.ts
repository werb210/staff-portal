import type { Application, Router } from "express";
import { injectSiloContext } from "../../../middleware/siloContext";
import { setCurrentSilo } from "../../../middleware/setCurrentSilo";
import { enforceBISilo } from "../../../middleware/enforceBISilo";

export function registerBIRoutes(app: Application, biRoutes: Router) {
  app.use(injectSiloContext);
  app.use(setCurrentSilo);
  app.use("/api/bi", enforceBISilo, biRoutes);
}
