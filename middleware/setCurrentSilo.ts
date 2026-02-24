import type { NextFunction, Request, Response } from "express";
import { db } from "../db";

export async function setCurrentSilo(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.silo) {
    return res.status(403).json({ error: "Missing silo context" });
  }

  await db.query("SELECT set_config('app.current_silo', $1, false)", [req.user.silo]);
  return next();
}
