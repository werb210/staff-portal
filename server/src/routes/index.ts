import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

// API ROOT
router.get("/", (_, res) => res.json({ ok: true, service: "staff-portal-api" }));

// AUTH
router.use("/auth", authRoutes);

export default router;
