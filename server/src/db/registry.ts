import prisma from './index.js';
import { containerClient } from '../services/blob.js';

// Registry helper to centralize database + blob clients
export const registry = {
  db: prisma,
  documents: (prisma as any).document,
  documentVersions: (prisma as any).documentVersion,
  blob: {
    getClient: (blobPath: string) => containerClient.getBlobClient(blobPath),
  },
};
