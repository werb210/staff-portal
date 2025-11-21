import apiClient from "../../core/api";

export interface DocumentRecord {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  status?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  applicationId?: string;
  s3Url?: string;
  pageCount?: number;
  tags?: string[];
}

export interface DocumentListResponse {
  documents?: DocumentRecord[];
  items?: DocumentRecord[];
  data?: DocumentRecord[];
}

export interface UploadDocumentInput {
  applicationId: string;
  file: File;
  type?: string;
  notes?: string;
  tags?: string[];
}

export interface OcrField {
  label: string;
  value: string;
  confidence?: number;
}

export interface BankingAnalysis {
  averageBalance?: string;
  monthlyRevenue?: string;
  nsfCount?: number;
  cashFlowScore?: number;
}

export interface MatchedProduct {
  id?: string;
  name: string;
  lender: string;
  matchScore?: number;
}

export interface OcrResponse {
  fields?: OcrField[];
  bankingAnalysis?: BankingAnalysis;
  errors?: string[];
  warnings?: string[];
  matchedProducts?: MatchedProduct[];
  rawText?: string;
}

export const fetchDocuments = <T = DocumentListResponse>(applicationId: string) =>
  apiClient.get<T>(`/api/documents/${applicationId}`);

export const uploadDocument = <T = unknown>({ applicationId, file, type, notes, tags }: UploadDocumentInput) => {
  const formData = new FormData();
  formData.append("applicationId", applicationId);
  formData.append("file", file);

  if (type) formData.append("type", type);
  if (notes) formData.append("notes", notes);
  tags?.forEach((tag) => formData.append("tags[]", tag));

  return apiClient.post<T>("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const fetchOcrReport = <T = OcrResponse>(documentId: string) => apiClient.get<T>(`/api/ocr/${documentId}`);
