export interface ApplicationSummary {
  id: string;
  businessName: string;
  contactName?: string;
  status: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
  amountRequested?: number;
  silo?: string;
  owner?: string;
}

export interface ApplicationPayload {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  amountRequested: number;
  silo: string;
}

export interface DocumentUploadPayload {
  applicationId: string;
  documentType: string;
  fileUrl: string;
}

export interface ApplicationCompletionPayload {
  applicationId: string;
  notes?: string;
}
