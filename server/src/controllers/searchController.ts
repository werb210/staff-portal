import { Request, Response } from "express";
import searchService from "../services/searchService";

const searchController = {
  globalSearch: async (req: Request, res: Response) => {
    const q = req.query.q as string;
    const results = await searchService.search(q || "");
    res.json({ success: true, data: results });
  },
};

export default searchController;
