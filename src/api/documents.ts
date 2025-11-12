import { mockDocuments } from '../mock';
import type { DocumentRecord } from '../types/documents';

export interface DocumentItem extends DocumentRecord {
  uploadedBy?: string;
  downloadUrl?: string;
  lastUploadedFileName?: string;
}

let documents: DocumentItem[] = mockDocuments.map((document) => ({
  ...document,
  uploadedBy: 'Borrower Portal',
}));

export const getDocuments = async (): Promise<DocumentItem[]> => documents;

export const approveDocument = async (id: string) => {
  documents = documents.map((document) =>
    document.id === id ? { ...document, status: 'approved', uploadedAt: new Date().toISOString() } : document,
  );
};

export const rejectDocument = async (id: string, reason: string) => {
  documents = documents.map((document) =>
    document.id === id
      ? {
          ...document,
          status: 'rejected',
          lastUploadedFileName: reason ? `${document.name} (Rejected: ${reason})` : document.lastUploadedFileName,
        }
      : document,
  );
};

export const uploadDocumentVersion = async (id: string, file: File) => {
  documents = documents.map((document) =>
    document.id === id
      ? {
          ...document,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
          lastUploadedFileName: file.name,
        }
      : document,
  );
  return { id, fileName: file.name };
};
