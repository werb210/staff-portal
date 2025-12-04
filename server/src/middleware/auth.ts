import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import usersRepo from "../db/repositories/users.repo.js";

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await usersRepo.findById(decoded.id);

    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

