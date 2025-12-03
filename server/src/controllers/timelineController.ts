import { Request, Response } from "express";
import timelineService from "../services/timelineService.js";

const timelineController = {
  async getTimeline(req: Request, res: Response) {
    try {
      const contactId = req.params.contactId;
      const items = await timelineService.list(contactId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async addEvent(req: Request, res: Response) {
    try {
      const contactId = req.params.contactId;
      const { eventType, description } = req.body;

      const event = await timelineService.add(contactId, eventType, description);
      res.json({ ok: true, event });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },
};

export default timelineController;
