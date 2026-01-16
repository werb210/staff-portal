export type SLFStageId = "received" | "lender-review" | "term-sheet" | "accepted" | "rejected";

export type SLFPipelineApplication = {
  id: string;
  applicantName: string;
  businessName: string;
  requestedAmount: number;
  productType: string;
  country: string;
  receivedDate: string;
  assignedStaff?: string | null;
  status: SLFStageId;
};

export type SLFPipelineStage = {
  id: SLFStageId;
  label: string;
  description?: string;
  terminal?: boolean;
};

export const SLF_PIPELINE_STAGES: SLFPipelineStage[] = [
  { id: "received", label: "Received", description: "Newly submitted applications" },
  { id: "lender-review", label: "Lender Review", description: "Under lender evaluation" },
  { id: "term-sheet", label: "Term Sheet", description: "Term sheet issued" },
  { id: "accepted", label: "Accepted", description: "Client accepted terms" },
  { id: "rejected", label: "Rejected", description: "Application rejected", terminal: true }
];
