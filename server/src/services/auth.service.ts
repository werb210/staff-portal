import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { usersRepo } from "../db/repositories/users.repo.js";

class AuthService {
  async login(email: string, password: string) {
    const user = await usersRepo.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
