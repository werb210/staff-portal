import { Request, Response, Router } from "express";
import contactsRepo from "../db/repositories/contacts.repo.js";
import companiesRepo from "../db/repositories/companies.repo.js";
import dealsRepo from "../db/repositories/deals.repo.js";

const router = Router();

// POST /api/search
router.post("/", async (req: Request, res: Response) => {
  try {
    const { query } = req.body ?? {};
    const q = (query ?? "").toString().trim();
    if (!q) {
      return res.json({ success: true, data: { contacts: [], companies: [], deals: [] } });
    }

    const like = `%${q}%`;

    const [contacts, companies, deals] = await Promise.all([
      contactsRepo.search ? contactsRepo.search(like) : contactsRepo.findAll(),
      companiesRepo.search ? companiesRepo.search(like) : companiesRepo.findAll(),
      dealsRepo.findAll(),
    ]);

    res.json({
      success: true,
      data: {
        contacts: contacts.rows ?? contacts,
        companies: companies.rows ?? companies,
        deals: deals.rows ?? deals,
      },
    });
  } catch (err: any) {
    console.error("searchController.search error:", err);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

export default router;
