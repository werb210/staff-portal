import { Request, Response } from "express";
import tagsRepo from "../db/repositories/tags.repo";

const tagsController = {
  list: async (_req: Request, res: Response) => {
    const data = await tagsRepo.findMany();
    res.json({ success: true, data });
  },

  create: async (req: Request, res: Response) => {
    const { name, color } = req.body ?? {};
    if (!name) {
      return res.status(400).json({ success: false, error: "Missing 'name'" });
    }
    const created = await tagsRepo.create({ name, color });
    res.status(201).json({ success: true, data: created });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await tagsRepo.update(id, req.body ?? {});
    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await tagsRepo.delete(id);
    res.json({ success: true, data: deleted });
  },

  attach: async (req: Request, res: Response) => {
    const { tagId, applicationId } = req.body ?? {};
    if (!tagId || !applicationId) {
      return res.status(400).json({
        success: false,
        error: "tagId and applicationId are required",
      });
    }
    await tagsRepo.attachToApp(tagId, applicationId);
    res.json({ success: true });
  },

  detach: async (req: Request, res: Response) => {
    const { tagId, applicationId } = req.body ?? {};
    if (!tagId || !applicationId) {
      return res.status(400).json({
        success: false,
        error: "tagId and applicationId are required",
      });
    }
    await tagsRepo.removeFromApp(tagId, applicationId);
    res.json({ success: true });
  },

  getForApp: async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const tags = await tagsRepo.getTagsForApp(applicationId);
    res.json({ success: true, data: tags });
  },
};

export default tagsController;
