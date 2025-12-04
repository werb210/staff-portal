import asyncHandler from "../utils/asyncHandler.js";
import contactsRepo from "../db/repositories/contacts.repo.js";

const contactsController = {
  list: asyncHandler(async (_req, res) => {
    const items = await contactsRepo.findMany();
    res.json({ success: true, data: items });
  }),

  get: asyncHandler(async (req, res) => {
    const item = await contactsRepo.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    res.json({ success: true, data: item });
  }),

  create: asyncHandler(async (req, res) => {
    const created = await contactsRepo.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = await contactsRepo.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = await contactsRepo.delete(req.params.id);
    res.json({ success: true, data: deleted });
  }),
};

export default contactsController;
