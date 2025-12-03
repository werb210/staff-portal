import asyncHandler from "../utils/asyncHandler";
import auditLogsRepo from "../db/repositories/auditLogs.repo";

const mapTag = (record: any) => {
  if (!record || record.eventType !== "tag") return null;
  const details = typeof record.details === "object" ? record.details : {};
  return { id: record.id, ...details, createdAt: record.createdAt };
};

export default {
  list: asyncHandler(async (_req, res) => {
    const records = await auditLogsRepo.findMany({ eventType: "tag" });
    res.json({ success: true, data: records.map(mapTag).filter(Boolean) });
  }),

  create: asyncHandler(async (req, res) => {
    const { name, color = null } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "Missing name" });

    const created = await auditLogsRepo.create({
      eventType: "tag",
      details: { name, color },
    });

    res.status(201).json({ success: true, data: mapTag(created) });
  }),

  update: asyncHandler(async (req, res) => {
    const existing = await auditLogsRepo.findById(req.params.id);
    if (!existing || existing.eventType !== "tag")
      return res.status(404).json({ error: "Not found" });

    const merged = { ...(existing.details || {}), ...req.body };
    const updated = await auditLogsRepo.update(req.params.id, {
      details: merged,
    } as any);

    res.json({ success: true, data: mapTag(updated) });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = await auditLogsRepo.delete(req.params.id);
    if (!deleted || deleted.eventType !== "tag")
      return res.status(404).json({ error: "Not found" });

    res.json({ success: true, data: mapTag(deleted) });
  }),
};
