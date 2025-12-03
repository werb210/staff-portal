import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { searchService } from "../services/searchService.js";

export const searchController = {
  global: asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q ?? "").toString().trim();
    const results = await searchService.globalSearch(q);
    res.status(200).json({ success: true, query: q, results });
  }),
};

export default searchController;
