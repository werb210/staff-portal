import bcrypt from "bcryptjs";
import usersRepo from "../db/repositories/users.repo.js";
import { signToken } from "../utils/jwt.js";

export const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    const user = (await usersRepo.findAll()).find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: user.id, role: user.role });

    res.json({ success: true, token, user });
  },
};

