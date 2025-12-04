import { newId } from "../utils/id.js";
import tagsRepo from "../db/repositories/tags.repo.js";

export const tagsController = {
  list: async (req, res) => {
    const rows = await tagsRepo.findAll();
    res.json({ success: true, data: rows });
  },

  create: async (req, res) => {
    const { name, color } = req.body;
    const created = await tagsRepo.create({
      id: newId(),
      name,
      color,
    });
    res.json({ success: true, data: created });
  },

  update: async (req, res) => {
    const updated = await tagsRepo.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  },

  remove: async (req, res) => {
    const deleted = await tagsRepo.delete(req.params.id);
    res.json({ success: true, data: deleted });
  },
};

