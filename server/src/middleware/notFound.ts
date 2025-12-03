import { Request, Response } from "express";

export default function notFound(req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}
