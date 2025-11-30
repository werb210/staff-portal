import prisma from './index.js';
import { containerClient } from '../services/blob.js';

// Registry helper to centralize database + blob clients
export const registry = {
  db: prisma,
  applications: (prisma as any).application,
  applicationForm: (prisma as any).applicationForm,
  banking: (prisma as any).banking,
  ocrResults: (prisma as any).ocrResult,
  documents: (prisma as any).document,
  documentVersions: (prisma as any).documentVersion,
  lenders: (prisma as any).lender,
  transmissionLog: (prisma as any).transmissionLog,
  blob: {
    getClient: (blobPath: string) => containerClient.getBlobClient(blobPath),
  },
};
