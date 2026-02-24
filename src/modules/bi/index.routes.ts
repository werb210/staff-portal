import type { Application, Router } from "express";
import { enforceBISilo } from "../../../middleware/enforceBISilo";

export function registerBIRoutes(app: Application, biRoutes: Router) {
  app.use("/api/bi", enforceBISilo, biRoutes);
}
