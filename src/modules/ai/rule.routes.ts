import { Router, type Request, type Response } from "express";
import { embedAndStore, type QueryableDb } from "./knowledge.service";

type DbRequest = Request & { db: QueryableDb };

const router = Router();

router.post("/ai/rule", async (req: Request, res: Response) => {
  const dbReq = req as DbRequest;
  const { content } = req.body as { content?: string };

  if (!content?.trim()) {
    res.status(400).json({ success: false, message: "content is required" });
    return;
  }

  await embedAndStore(dbReq.db, content, "rule");
  res.json({ success: true });
});

export default router;
