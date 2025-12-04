import companiesRepo from "../db/repositories/companies.repo.js";
import { newId } from "../utils/id.js";

export const companiesController = {
  list: async (req, res) => {
    const rows = await companiesRepo.findAll();
    res.json({ success: true, data: rows });
  },

  get: async (req, res) => {
    const record = await companiesRepo.findById(req.params.id);
    res.json({ success: true, data: record });
  },

  create: async (req, res) => {
    const created = await companiesRepo.create({
      id: newId(),
      ...req.body,
    });
    res.json({ success: true, data: created });
  },

  update: async (req, res) => {
    const updated = await companiesRepo.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  },

  remove: async (req, res) => {
    const deleted = await companiesRepo.delete(req.params.id);
    res.json({ success: true, data: deleted });
  },
};

