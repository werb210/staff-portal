import asyncHandler from "../utils/asyncHandler";
import companiesService from "../services/companiesService.js";

export default {
  list: asyncHandler(async (_req, res) => {
    const data = await companiesService.list();
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req, res) => {
    const item = await companiesService.get(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: item });
  }),

  create: asyncHandler(async (req, res) => {
    const created = await companiesService.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = await companiesService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req, res) => {
    const removed = await companiesService.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: removed });
  })
};
