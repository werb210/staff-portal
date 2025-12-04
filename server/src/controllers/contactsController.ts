import contactsRepo from "../db/repositories/contacts.repo.js";
import { newId } from "../utils/id.js";

export const contactsController = {
  list: async (req, res) => {
    const rows = await contactsRepo.findAll();
    res.json({ success: true, data: rows });
  },

  get: async (req, res) => {
    const record = await contactsRepo.findById(req.params.id);
    res.json({ success: true, data: record });
  },

  create: async (req, res) => {
    const created = await contactsRepo.create({
      id: newId(),
      ...req.body,
    });
    res.json({ success: true, data: created });
  },

  update: async (req, res) => {
    const updated = await contactsRepo.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  },

  remove: async (req, res) => {
    const deleted = await contactsRepo.delete(req.params.id);
    res.json({ success: true, data: deleted });
  },
};

