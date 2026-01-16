export type DocumentStatus = "required" | "uploaded" | "approved" | "rejected";

export type DocumentRequirement = {
  id: string;
  name: string;
  category?: string | null;
  status: DocumentStatus;
  uploadedAt?: string | null;
  size?: number | null;
  version?: number | null;
  rejectionReason?: string | null;
  requiredBy?: string | null;
};

export type DocumentRequirementResponse = DocumentRequirement[];
