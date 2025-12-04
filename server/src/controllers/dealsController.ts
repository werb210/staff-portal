import dealsRepo from "../db/repositories/deals.repo.js";

export default {
  getAll: async (req, res) => {
    res.json(await dealsRepo.findAll());
  },

  getOne: async (req, res) => {
    const item = await dealsRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Deal not found" });
    res.json(item);
  },

  create: async (req, res) => {
    res.json(await dealsRepo.create(req.body));
  },

  update: async (req, res) => {
    const item = await dealsRepo.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Deal not found" });
    res.json(item);
  },

  delete: async (req, res) => {
    const item = await dealsRepo.delete(req.params.id);
    if (!item) return res.status(404).json({ error: "Deal not found" });
    res.json(item);
  },
};
