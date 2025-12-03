import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { usersRepo } from "../db/repositories/users.repo.js";

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await authService.login(email, password);
    if (!result) return res.status(401).json({ error: "Invalid credentials" });

    return res.json(result);
  }

  async me(req: any, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await usersRepo.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const decoded: any = verifyRefreshToken(refreshToken);
      const user = await usersRepo.findById(decoded.id);
      if (!user) return res.status(401).json({ error: "Invalid token" });

      return res.json({
        accessToken: signAccessToken({ id: user.id, role: user.role }),
      });
    } catch (err) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
  }

  async logout(req: Request, res: Response) {
    return res.json({ success: true });
  }
}

export const authController = new AuthController();
