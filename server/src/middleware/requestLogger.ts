import { Request, Response, NextFunction } from "express";

export default function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  console.log(`${req.method} ${req.url}`);
  next();
}
