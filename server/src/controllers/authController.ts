import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import usersRepo from "../db/repositories/users.repo.js";

const router = Router();

// SIMPLE DEV TOKEN GENERATOR (NO JWT YET)
const buildToken = (userId: string) => `dev-token-${userId}`;

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Missing email or password" });
    }

    const result = await usersRepo.findByEmail(email);
    const user = (result.rows ?? result)[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = buildToken(user.id);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    console.error("authController.login error:", err);
    res.status(500).json({ success: false, error: "Failed to login" });
  }
});

export default router;
