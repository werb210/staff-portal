import tagsRepo from "../db/repositories/tags.repo.js";

export default {
  getAll: async (req, res) => {
    res.json(await tagsRepo.findAll());
  },

  getOne: async (req, res) => {
    const item = await tagsRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Tag not found" });
    res.json(item);
  },

  create: async (req, res) => {
    res.json(await tagsRepo.create(req.body));
  },

  update: async (req, res) => {
    const item = await tagsRepo.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Tag not found" });
    res.json(item);
  },

  delete: async (req, res) => {
    const item = await tagsRepo.delete(req.params.id);
    if (!item) return res.status(404).json({ error: "Tag not found" });
    res.json(item);
  },
};
