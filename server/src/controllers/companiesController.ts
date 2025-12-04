import companiesRepo from "../db/repositories/companies.repo.js";

export default {
  getAll: async (req, res) => {
    const items = await companiesRepo.findAll();
    res.json(items);
  },

  getOne: async (req, res) => {
    const item = await companiesRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Company not found" });
    res.json(item);
  },

  create: async (req, res) => {
    res.json(await companiesRepo.create(req.body));
  },

  update: async (req, res) => {
    const item = await companiesRepo.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Company not found" });
    res.json(item);
  },

  delete: async (req, res) => {
    const item = await companiesRepo.delete(req.params.id);
    if (!item) return res.status(404).json({ error: "Company not found" });
    res.json(item);
  },
};
