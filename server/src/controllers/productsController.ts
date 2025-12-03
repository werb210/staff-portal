import { Request, Response } from "express";
import productsRepo from "../db/repositories/products.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

export default {
  findMany: asyncHandler(async (_req: Request, res: Response) => {
    return res.json(await productsRepo.findMany());
  }),
  findById: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await productsRepo.findById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await productsRepo.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await productsRepo.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    return res.json(await productsRepo.delete(req.params.id));
  }),
};
