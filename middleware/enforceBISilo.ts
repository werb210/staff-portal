import { Request, Response, NextFunction } from "express";

export function enforceBISilo(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.silo !== "BI") {
    return res.status(403).json({ error: "BI silo only" });
  }

  return next();
}
