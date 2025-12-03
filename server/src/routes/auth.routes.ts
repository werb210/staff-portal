import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", requireAuth, (req, res) => authController.me(req, res));
router.post("/refresh", (req, res) => authController.refresh(req, res));
router.post("/logout", requireAuth, (req, res) => authController.logout(req, res));

export default router;
