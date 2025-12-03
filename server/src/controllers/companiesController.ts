import { Request, Response } from "express";
import companiesRepo from "../db/repositories/companies.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

export default {
  findMany: asyncHandler(async (_req: Request, res: Response) => {
    return res.json(await companiesRepo.findMany());
  }),
  findById: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await companiesRepo.findById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await companiesRepo.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await companiesRepo.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await companiesRepo.delete(req.params.id));
  }),
};
