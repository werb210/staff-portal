import usersRepo from "../db/repositories/users.repo.js";

export default {
  getAll: async (req, res) => {
    res.json(await usersRepo.findAll());
  },

  getOne: async (req, res) => {
    const item = await usersRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "User not found" });
    res.json(item);
  },

  create: async (req, res) => {
    res.json(await usersRepo.create(req.body));
  },

  update: async (req, res) => {
    const item = await usersRepo.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "User not found" });
    res.json(item);
  },

  delete: async (req, res) => {
    const item = await usersRepo.delete(req.params.id);
    if (!item) return res.status(404).json({ error: "User not found" });
    res.json(item);
  },
};
