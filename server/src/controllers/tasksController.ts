import tasksRepo from "../db/repositories/tasks.repo.js";

export default {
  getAll: async (req, res) => {
    res.json(await tasksRepo.findAll());
  },

  getOne: async (req, res) => {
    const item = await tasksRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Task not found" });
    res.json(item);
  },

  create: async (req, res) => {
    res.json(await tasksRepo.create(req.body));
  },

  update: async (req, res) => {
    const item = await tasksRepo.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Task not found" });
    res.json(item);
  },

  delete: async (req, res) => {
    const item = await tasksRepo.delete(req.params.id);
    if (!item) return res.status(404).json({ error: "Task not found" });
    res.json(item);
  },
};
