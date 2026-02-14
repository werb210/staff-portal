import type { Express } from "express";
import confidenceRoutes from "./confidence.routes";
import ruleRoutes from "./rule.routes";
import voiceRoutes from "./voice.routes";

export function registerAiRoutes(app: Express) {
  app.use("/api", ruleRoutes);
  app.use("/api", confidenceRoutes);
  app.use("/api", voiceRoutes);
}
