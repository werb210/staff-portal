import api from "@/lib/api/client";

export type DocumentStatus = "accepted" | "rejected" | "missing" | "pending";

export interface DocumentSummary {
  id: string;
  name: string;
  status: DocumentStatus;
  checksum?: string;
  checksumValid?: boolean;
  fileUrl?: string;
  updatedAt?: string;
}

export interface DocumentDetails extends DocumentSummary {
  versions?: DocumentVersion[];
  documents?: DocumentSummary[];
  pages?: number;
}

export interface DocumentVersion {
  id: string;
  uploadedAt: string;
  checksum: string;
  fileUrl?: string;
}

export async function fetchDocument(id: string): Promise<DocumentDetails> {
  const res = await api.get(`/api/documents/${id}`);
  return res.data as DocumentDetails;
}

export async function acceptDocument(id: string): Promise<void> {
  await api.post(`/api/documents/${id}/accept`);
}

export async function rejectDocument(id: string): Promise<void> {
  await api.post(`/api/documents/${id}/reject`);
}

export async function reuploadDocument(id: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  await api.post(`/api/documents/${id}/reupload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function fetchDocumentVersions(id: string): Promise<DocumentVersion[]> {
  const res = await api.get(`/api/documents/${id}/versions`);
  return res.data as DocumentVersion[];
}
