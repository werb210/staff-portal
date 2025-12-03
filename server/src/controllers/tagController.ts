import { Request, Response } from "express";
import auditLogsRepo from "../db/repositories/auditLogs.repo.js";
import asyncHandler from "../utils/asyncHandler.js";
import { safeDetails } from "../utils/safeDetails.js";

const mapTag = (record: any) => {
  if (!record || record.eventType !== "tag") return null;
  const details = safeDetails(record.details as Record<string, any>);
  return { id: record.id, ...details, createdAt: record.createdAt };
};

const isDbConfigured = Boolean(process.env.DATABASE_URL);
const respondUnavailable = (res: Response) =>
  res.status(503).json({ success: false, error: "Database not configured" });
const respondEmpty = (res: Response) => res.json({ success: true, data: [] });

export const tagController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    if (!isDbConfigured) return respondEmpty(res);
    try {
      const rows = await auditLogsRepo.findMany({ eventType: "tag" });
      return res.json({ success: true, data: rows.map(mapTag).filter(Boolean) });
    } catch (_err) {
      return respondEmpty(res);
    }
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    const { name, color = null } = req.body ?? {};
    if (!name || typeof name !== "string")
      return res.status(400).json({ success: false, error: "Missing or invalid 'name'" });

    try {
      const created = await auditLogsRepo.create({
        eventType: "tag",
        details: { name, color }
      });

      res.status(201).json({ success: true, data: mapTag(created) });
    } catch (_err) {
      res.status(503).json({ success: false, error: "Unable to create tag" });
    }
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);

    try {
      const existing = await auditLogsRepo.findById(req.params.id);
      if (!existing || existing.eventType !== "tag")
        return res.status(404).json({ success: false, error: "Tag not found" });

      const base = safeDetails(existing.details as Record<string, any>);
      const patch = safeDetails(req.body as Record<string, any>);

      const merged = { ...base, ...patch };

      const updated = await auditLogsRepo.update(req.params.id, merged);
      res.json({ success: true, data: mapTag(updated) });
    } catch (_err) {
      res.status(503).json({ success: false, error: "Unable to update tag" });
    }
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);

    try {
      const deleted = await auditLogsRepo.delete(req.params.id);
      if (!deleted || deleted.eventType !== "tag")
        return res.status(404).json({ success: false, error: "Tag not found" });

      res.json({ success: true, data: mapTag(deleted) });
    } catch (_err) {
      res.status(503).json({ success: false, error: "Unable to delete tag" });
    }
  })
};

export default tagController;
