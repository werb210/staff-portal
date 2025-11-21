import { Request, Response } from "express";
import prisma from "../db/index.js";

export async function getPagedApplications(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(1, Number(req.query.pageSize) || 25);
    const search = String(req.query.search || "").trim();

    const allowedSortFields = ["createdAt", "businessName", "contactName", "status"] as const;
    const sortBy = allowedSortFields.includes(String(req.query.sortBy))
      ? String(req.query.sortBy)
      : "createdAt";

    const sortDirection = String(req.query.sortDirection).toLowerCase() === "asc" ? "asc" : "desc";

    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { businessName: { contains: search, mode: "insensitive" } },
            { contactName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip,
        take: pageSize,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch applications",
      details: err.message || err,
    });
  }
}
