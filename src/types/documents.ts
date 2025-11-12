export interface DocumentRecord {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewer?: string;
  applicationId?: string;
}

export interface DocumentStatusPayload {
  status: DocumentRecord['status'];
  notes?: string;
}
