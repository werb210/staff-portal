import { Request, Response } from "express";
import pipelineEventsService from "../services/pipelineEventsService";

const pipelineEventsController = {
  listByApplication: async (req: Request, res: Response) => {
    const events = await pipelineEventsService.listByApplication(req.params.id);
    res.json({ success: true, data: events });
  },

  create: async (req: Request, res: Response) => {
    const created = await pipelineEventsService.recordEvent(req.body ?? {});
    res.status(201).json({ success: true, data: created });
  },
};

export default pipelineEventsController;
