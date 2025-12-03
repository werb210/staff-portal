import { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("API Error:", err);

  return res.status(500).json({
    success: false,
    message: err?.message || "Internal Server Error",
  });
}
