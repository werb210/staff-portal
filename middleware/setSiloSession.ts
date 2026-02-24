import type { NextFunction, Request, Response } from "express";
import { db } from "../db";

const VALID_SILOS = new Set(["BF", "BI", "SLF"]);

export async function setSiloSession(req: Request, res: Response, next: NextFunction) {
  const userSilo = req.user?.silo;

  if (!userSilo || !VALID_SILOS.has(userSilo)) {
    return res.status(403).json({ error: "Missing silo context" });
  }

  try {
    await db.query("SET app.current_silo = $1", [userSilo]);
    return next();
  } catch (err) {
    console.error("Failed to set silo session", err);
    return res.status(500).json({ error: "Silo session error" });
  }
}
