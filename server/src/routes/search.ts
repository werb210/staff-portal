import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import contactsRepo from "../db/repositories/contacts.repo.js";
import companiesRepo from "../db/repositories/companies.repo.js";
import applicationsRepo from "../db/repositories/applications.repo.js";
import productsRepo from "../db/repositories/products.repo.js";
import lendersRepo from "../db/repositories/lenders.repo.js";

const r = Router();

r.get(
  "/contacts",
  asyncHandler(async (req: any, res: any) => {
    const q = (req.query.q || "").toString().toLowerCase().trim();
    const companyFilter = q.startsWith("company:") ? q.split(":")[1] : null;

    let contacts: any[] = [];
    if (companyFilter && contactsRepo.findByCompany) {
      const filtered = await contactsRepo.findByCompany(companyFilter);
      contacts = (filtered.rows ?? filtered) as any[];
    } else {
      const raw = await contactsRepo.findAll();
      contacts = (raw.rows ?? raw) as any[];
    }

    const withNames = contacts.map((c) => ({
      ...c,
      name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
    }));

    const match = (item: any) =>
      !q || JSON.stringify(item).toLowerCase().includes(q);

    const data = companyFilter ? withNames.slice(0, 50) : withNames.filter(match).slice(0, 50);
    res.json({ success: true, data });
  })
);

r.get(
  "/companies",
  asyncHandler(async (req: any, res: any) => {
    const q = (req.query.q || "").toString().toLowerCase().trim();
    const raw = await companiesRepo.findAll();
    const companies = (raw.rows ?? raw) as any[];

    const match = (item: any) => !q || JSON.stringify(item).toLowerCase().includes(q);
    const data = companies.filter(match).slice(0, 50);

    res.json({ success: true, data });
  })
);

r.get(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const q = (req.query.q || "").toString().toLowerCase().trim();
    if (!q) return res.json({ success: true, data: [] });

    const [contactsRes, companiesRes, appsRes, productsRes, lendersRes] =
      await Promise.all([
        contactsRepo.findAll(),
        companiesRepo.findAll(),
        applicationsRepo.findAll(),
        productsRepo.getAll(),
        lendersRepo.findAll(),
      ]);

    const contacts = (contactsRes as any)?.rows ?? contactsRes;
    const companies = (companiesRes as any)?.rows ?? companiesRes;
    const apps = (appsRes as any)?.rows ?? appsRes;
    const products = (productsRes as any)?.rows ?? productsRes;
    const lenders = (lendersRes as any)?.rows ?? lendersRes;

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
