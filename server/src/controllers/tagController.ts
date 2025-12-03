import { Request, Response } from "express";
import auditLogsRepo from "../db/repositories/auditLogs.repo.js";
import asyncHandler from "../utils/asyncHandler.js";
import { safeDetails } from "../utils/safeDetails.js";

const mapTag = (record: any) => {
  if (!record || record.eventType !== "tag") return null;
  const details = safeDetails(record.details as Record<string, any>);
  return { id: record.id, ...details, createdAt: record.createdAt };
};

export const tagController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const rows = await auditLogsRepo.findMany({ eventType: "tag" });
    res.json({ success: true, data: rows.map(mapTag).filter(Boolean) });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { name, color = null } = req.body ?? {};
    if (!name || typeof name !== "string")
      return res.status(400).json({ success: false, error: "Missing or invalid 'name'" });

    const created = await auditLogsRepo.create({
      eventType: "tag",
      details: { name, color }
    });

    res.status(201).json({ success: true, data: mapTag(created) });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const existing = await auditLogsRepo.findById(req.params.id);
    if (!existing || existing.eventType !== "tag")
      return res.status(404).json({ success: false, error: "Tag not found" });

    const base = safeDetails(existing.details as Record<string, any>);
    const patch = safeDetails(req.body as Record<string, any>);

    const merged = { ...base, ...patch };

    const updated = await auditLogsRepo.update(req.params.id, merged);
    res.json({ success: true, data: mapTag(updated) });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await auditLogsRepo.delete(req.params.id);
    if (!deleted || deleted.eventType !== "tag")
      return res.status(404).json({ success: false, error: "Tag not found" });

    res.json({ success: true, data: mapTag(deleted) });
  })
};

export default tagController;
