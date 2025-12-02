import asyncHandler from "../utils/asyncHandler.js";
import { auditViewerRepo } from "../db/repositories/auditViewer.repo.js";

export const auditViewerController = {
  search: asyncHandler(async (req: any, res) => {
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "Not authorized" });

    const result = await auditViewerRepo.search({
      eventType: req.query.eventType || null,
      userId: req.query.userId || null,
      from: req.query.from || null,
      to: req.query.to || null,
      keyword: req.query.keyword || null,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 25,
    });

    res.json({ success: true, data: result });
  }),
};
