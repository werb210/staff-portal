import { Request, Response } from "express";

export const healthController = {
  basic: (_req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      service: "staff-portal",
      timestamp: new Date().toISOString(),
    });
  },
};

export default healthController;
