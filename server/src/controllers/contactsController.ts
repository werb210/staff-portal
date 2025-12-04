import contactsRepo from "../db/repositories/contacts.repo.js";

export default {
  getAll: async (req, res) => {
    const items = await contactsRepo.findAll();
    res.json(items);
  },

  getOne: async (req, res) => {
    const id = req.params.id;
    const item = await contactsRepo.findById(id);
    if (!item) return res.status(404).json({ error: "Contact not found" });
    res.json(item);
  },

  create: async (req, res) => {
    const item = await contactsRepo.create(req.body);
    res.json(item);
  },

  update: async (req, res) => {
    const item = await contactsRepo.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Contact not found" });
    res.json(item);
  },

  delete: async (req, res) => {
    const item = await contactsRepo.delete(req.params.id);
    if (!item) return res.status(404).json({ error: "Contact not found" });
    res.json(item);
  },
};
