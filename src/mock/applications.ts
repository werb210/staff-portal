import type { ApplicationSummary } from '../types/applications';

export const mockApplications: ApplicationSummary[] = [
  {
    id: 'app-1001',
    businessName: 'Northwind Outfitters',
    stage: 'New',
    status: 'Pending',
    amountRequested: 125000,
    silo: 'BF',
    owner: 'Jamie Rivera',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-1002',
    businessName: 'Summit Solar Co',
    stage: 'Underwriting',
    status: 'In Review',
    amountRequested: 450000,
    silo: 'SLF',
    owner: 'Priya Shah',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'app-1003',
    businessName: 'Evergreen Clinics',
    stage: 'Funded',
    status: 'Funded',
    amountRequested: 98000,
    silo: 'BF',
    owner: 'Taylor Smith',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];
