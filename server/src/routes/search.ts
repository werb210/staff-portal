import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import contactsRepo from "../db/repositories/contacts.repo.js";
import companiesRepo from "../db/repositories/companies.repo.js";
import applicationsRepo from "../db/repositories/applications.repo.js";
import productsRepo from "../db/repositories/products.repo.js";
import lendersRepo from "../db/repositories/lenders.repo.js";

const r = Router();

r.get(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const q = (req.query.q || "").toString().toLowerCase().trim();
    if (!q) return res.json({ success: true, data: [] });

    const [contacts, companies, apps, products, lenders] = await Promise.all([
      contactsRepo.findMany(),
      companiesRepo.findMany(),
      applicationsRepo.findMany(),
      productsRepo.findMany(),
      lendersRepo.findMany(),
    ]);

    const match = (item: any) =>
      JSON.stringify(item).toLowerCase().includes(q);

    const results = [
      ...contacts.filter(match).map((x) => ({ type: "contact", ...x })),
      ...companies.filter(match).map((x) => ({ type: "company", ...x })),
      ...apps.filter(match).map((x) => ({ type: "application", ...x })),
      ...products.filter(match).map((x) => ({ type: "product", ...x })),
      ...lenders.filter(match).map((x) => ({ type: "lender", ...x })),
    ].slice(0, 50);

    res.json({ success: true, data: results });
  })
);

export default r;
