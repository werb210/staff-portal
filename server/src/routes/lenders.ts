// server/src/routes/lenders.ts
import { Router } from "express";
import { registry } from "../db/registry.js";
import { buildLenderPacket, transmitToLender } from "../services/lenderPacket.js";

const router = Router();

/**
 * GET /lenders
 * List all configured lenders/products
 */
router.get("/", async (_req, res) => {
  const items = await registry.lenders.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.json(items);
});

/**
 * POST /lenders
 * Create lender product
 */
router.post("/", async (req, res) => {
  const data = req.body;

  const item = await registry.lenders.create({
    data: {
      lenderName: data.lenderName,
      productCategory: data.productCategory,
      amountRange: data.amountRange,
      creditRequirements: data.creditRequirements,
      requiredDocs: data.requiredDocs,
      disqualifiers: data.disqualifiers,
      active: data.active,
    },
  });

  res.json(item);
});

/**
 * PUT /lenders/:id
 * Update lender product
 */
router.put("/:id", async (req, res) => {
  const data = req.body;

  const item = await registry.lenders.update({
    where: { id: req.params.id },
    data: {
      lenderName: data.lenderName,
      productCategory: data.productCategory,
      amountRange: data.amountRange,
      creditRequirements: data.creditRequirements,
      requiredDocs: data.requiredDocs,
      disqualifiers: data.disqualifiers,
      active: data.active,
    },
  });

  res.json(item);
});

/**
 * PATCH /lenders/:id/active
 */
router.patch("/:id/active", async (req, res) => {
  const lender = await registry.lenders.findUnique({
    where: { id: req.params.id },
  });

  const updated = await registry.lenders.update({
    where: { id: req.params.id },
    data: { active: !lender?.active },
  });

  res.json(updated);
});

/**
 * POST /lenders/send/:applicationId/:lenderId
 * Build and send lender packet via API
 */
router.post("/send/:applicationId/:lenderId", async (req, res) => {
  const { applicationId, lenderId } = req.params;

  const lender = await registry.lenders.findUnique({
    where: { id: lenderId },
  });

  if (!lender) return res.status(404).json({ error: "Lender product not found" });

  if (!lender.endpointUrl)
    return res.status(400).json({
      error: "Lender product missing endpointUrl",
    });

  const result = await transmitToLender({
    applicationId,
    lenderId,
    endpoint: lender.endpointUrl,
  });

  // Basic logging (Block 27 adds full retry)
  await registry.transmissionLog.create({
    data: {
      applicationId,
      lenderId,
      status: result.ok ? "success" : "failed",
      response: result.response || result.error || "",
      packet: result.packet,
    },
  });

  res.json(result);
});

export default router;
