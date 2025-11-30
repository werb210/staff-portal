// server/src/services/lenderPacket.ts
import { registry } from "../db/registry.js";
import { getDownloadUrl } from "./blob.js";

/**
 * Build the full lender packet
 * This packet is sent to the lender via API or email depending on future needs.
 */
export async function buildLenderPacket(applicationId: string, lenderId: string) {
  // -------------------------------
  // LOAD PRIMARY APPLICATION
  // -------------------------------
  const app = await registry.applications.findUnique({
    where: { id: applicationId },
  });

  if (!app) throw new Error("APPLICATION_NOT_FOUND");

  // -------------------------------
  // LOAD FORM DATA
  // -------------------------------
  const formData = await registry.applicationForm.findUnique({
    where: { applicationId },
  });

  // -------------------------------
  // LOAD BANKING DATA
  // -------------------------------
  const banking = await registry.banking.findUnique({
    where: { applicationId },
  });

  // -------------------------------
  // LOAD OCR DATA
  // -------------------------------
  const ocr = await registry.ocrResults.findMany({
    where: { applicationId },
  });

  // Normalize OCR structure
  const ocrNormalized = ocr.map((d) => ({
    documentId: d.documentId,
    category: d.documentCategory,
    fields: d.fields,
  }));

  // -------------------------------
  // LOAD DOCUMENTS
  // -------------------------------
  const docs = await registry.documents.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });

  const docManifest = [] as any[];
  for (const d of docs) {
    docManifest.push({
      id: d.id,
      category: d.category,
      status: d.status,
      filename: d.name,
      version: d.version,
      checksum: d.checksum,
      missing: d.missing,
      sasUrl: getDownloadUrl(d.s3Key || d.blobPath),
    });
  }

  // -------------------------------
  // LOAD LENDER PRODUCT INFO
  // -------------------------------
  const lenderProduct = await registry.lenders.findUnique({
    where: { id: lenderId },
  });

  if (!lenderProduct) throw new Error("LENDER_NOT_FOUND");

  // -------------------------------
  // BUILD MASTER PACKET
  // -------------------------------
  const packet = {
    envelope: {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      applicationId,
      silo: app.silo,
      lenderId,
      lenderName: lenderProduct.lenderName,
      productCategory: lenderProduct.productCategory,
    },

    application: {
      id: app.id,
      businessName: app.businessName,
      applicantName: app.applicantName,
      email: app.applicantEmail,
      phone: app.applicantPhone,
      requestedAmount: app.requestedAmount,
      pipelineStage: app.pipelineStage,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    },

    formData: formData?.data || {},

    bankingAnalysis: banking
      ? {
          nsfCount: banking.nsfCount || 0,
          avgDailyBalance: banking.avgDailyBalance,
          monthlyRevenue: banking.monthlyRevenue,
          stabilityScore: banking.stabilityScore,
          cashFlowScore: banking.cashFlowScore,
          flags: banking.flags || {},
        }
      : {},

    ocrInsights: ocrNormalized,

    documents: docManifest,

    metadata: {
      documentCount: docManifest.length,
      missingDocuments: docManifest.filter((d) => d.missing).length,
      rejectedDocuments: docManifest.filter((d) => d.status === "rejected").length,
    },
  };

  return packet;
}

/**
 * Transmission wrapper for future retry queue
 */
export async function transmitToLender({
  applicationId,
  lenderId,
  endpoint,
}: {
  applicationId: string;
  lenderId: string;
  endpoint: string;
}) {
  const packet = await buildLenderPacket(applicationId, lenderId);

  // Placeholder for actual HTTP delivery until Block 27:
  // (retry queue + logging)
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packet),
    });

    return {
      ok: res.ok,
      status: res.status,
      response: await res.text(),
      packet,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err.message,
      packet,
    };
  }
}
