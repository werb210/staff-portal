import { Request, Response, NextFunction } from "express";

export type Silo = "BF" | "BI" | "SLF";

const validSilos: Silo[] = ["BF", "BI", "SLF"];

const isValidSilo = (value: unknown): value is Silo =>
  typeof value === "string" && validSilos.includes(value as Silo);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        role?: string;
        silo?: Silo;
      };
      silo?: Silo;
    }
  }
}

export function injectSiloContext(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !isValidSilo(req.user.silo)) {
    return res.status(403).json({ error: "Missing silo context" });
  }

  req.silo = req.user.silo;
  return next();
}
