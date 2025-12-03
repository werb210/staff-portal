import { Request, Response } from "express";
import usersRepo from "../db/repositories/users.repo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export default {
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await usersRepo.findByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }
};
