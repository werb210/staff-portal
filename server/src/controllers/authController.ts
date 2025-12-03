import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import usersRepo from "../db/repositories/users.repo.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { signToken } from "../utils/jwt.js";

const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await usersRepo.findByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: user.id, role: user.role });
    return res.json({ token, user: sanitizeUser(user) });
  }),
};

export default authController;
