import asyncHandler from "../utils/asyncHandler";
import companiesRepo from "../db/repositories/companies.repo";

export default {
  list: asyncHandler(async (_req, res) => {
    const data = await companiesRepo.findMany();
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req, res) => {
    const item = await companiesRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: item });
  }),

  create: asyncHandler(async (req, res) => {
    const created = await companiesRepo.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = await companiesRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req, res) => {
    const removed = await companiesRepo.delete(req.params.id);
    if (!removed) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: removed });
  })
};
