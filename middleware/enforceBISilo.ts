import { Request, Response, NextFunction } from "express";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    role?: string;
    silo?: string;
  };
};

export function enforceBISilo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (user.silo !== "BI") {
    return res.status(403).json({ error: "Forbidden: BI silo only" });
  }

  next();
}
