import { Request, Response, NextFunction } from "express";

export function enforceBISilo(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.silo !== "BI") {
    return res.status(403).json({ error: "Forbidden: BI silo only" });
  }

  return next();
}
