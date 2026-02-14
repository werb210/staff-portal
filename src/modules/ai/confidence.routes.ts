import { Router, type Request, type Response } from "express";

type LeadStore = {
  create: (lead: Record<string, unknown>) => Promise<unknown>;
};

type DbRequest = Request & {
  db: {
    leads: LeadStore;
  };
};

const router = Router();

router.post("/ai/confidence", async (req: Request, res: Response) => {
  const dbReq = req as DbRequest;
  const {
    companyName,
    fullName,
    email,
    phone,
    industry,
    yearsInBusiness,
    monthlyRevenue
  } = dbReq.body as {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    industry: string;
    yearsInBusiness: number;
    monthlyRevenue: number;
  };

  const score = yearsInBusiness > 2 && monthlyRevenue > 20000 ? "Strong" : "Needs Review";

  await dbReq.db.leads.create({
    companyName,
    fullName,
    email,
    phone,
    industry,
    tags: ["confidence_check"],
    createdAt: new Date()
  });

  res.json({
    score,
    message:
      score === "Strong"
        ? "Based on the information provided, your business appears aligned with common underwriting parameters."
        : "We recommend speaking with an advisor to explore structuring options."
  });
});

export default router;
