import type { DocumentRecord } from '../types/documents';

export const mockDocuments: DocumentRecord[] = [
  {
    id: 'doc-2001',
    applicationId: 'app-1001',
    name: 'Voided Check.pdf',
    category: 'Banking',
    status: 'pending',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'doc-2002',
    applicationId: 'app-1002',
    name: '2024 P&L.xlsx',
    category: 'Financials',
    status: 'approved',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'doc-2003',
    applicationId: 'app-1003',
    name: 'Ownership Ledger.docx',
    category: 'Corporate',
    status: 'rejected',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];
