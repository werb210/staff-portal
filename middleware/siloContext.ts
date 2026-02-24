import { Request, Response, NextFunction } from "express";

export type Silo = "BF" | "BI" | "SLF";

const validSilos: Silo[] = ["BF", "BI", "SLF"];

const isValidSilo = (value: unknown): value is Silo =>
  typeof value === "string" && validSilos.includes(value as Silo);

export function assertAuthenticatedSilo(user: { silo?: unknown }) {
  if (!isValidSilo(user.silo)) {
    throw new Error("Invalid silo assignment");
  }
}

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
  if (!req.user) {
    return res.status(403).json({ error: "Missing silo context" });
  }

  try {
    assertAuthenticatedSilo(req.user);
  } catch {
    return res.status(403).json({ error: "Invalid silo assignment" });
  }

  req.silo = req.user.silo;
  return next();
}
