import { registry } from '../db/registry.js';
import { blobExists, deleteBlob, buildBlobPath } from './blob.js';
import { calculateSHA256 } from '../utils/checksum.js';

interface IntegrityReport {
  missingFiles: any[];
  orphanedRecords: any[];
  badChecksums: any[];
  ok: boolean;
}

/**
 * Perform a full integrity audit for a single document
 */
export async function auditDocument(doc: any): Promise<any> {
  const report: any = {
    documentId: doc.id,
    blobPath: doc.s3Key || doc.blobPath,
    exists: false,
    checksumValid: true,
    version: doc.version,
    expectedChecksum: doc.checksum,
    actualChecksum: null,
  };

  // 1. Check if blob exists
  const exists = await blobExists(report.blobPath);
  report.exists = exists;

  if (!exists) {
    return {
      ...report,
      ok: false,
      error: 'MISSING_BLOB',
    };
  }

  // 2. Check checksum (only if DB stored checksum)
  if (doc.checksum) {
    try {
      const blobClient = registry.blob.getClient(report.blobPath);
      const download = await blobClient.download(0);
      const buffer = Buffer.from(await streamToBuffer(download.readableStreamBody));
      const actual = calculateSHA256(buffer);
      report.actualChecksum = actual;

      if (actual !== doc.checksum) {
        report.checksumValid = false;
        return {
          ...report,
          ok: false,
          error: 'BAD_CHECKSUM',
        };
      }
    } catch (err: any) {
      return {
        ...report,
        ok: false,
        error: 'CHECKSUM_ERROR',
      };
    }
  }

  return {
    ...report,
    ok: true,
  };
}

/**
 * Full application audit
 */
export async function auditApplication(applicationId: string) {
  const docs = await registry.documents.findMany({
    where: { applicationId },
  });

  const missingFiles: any[] = [];
  const orphanedRecords: any[] = [];
  const badChecksums: any[] = [];

  for (const doc of docs) {
    const report = await auditDocument(doc);

    if (!report.ok) {
      if (report.error === 'MISSING_BLOB') missingFiles.push(report);
      if (report.error === 'BAD_CHECKSUM') badChecksums.push(report);
      if (report.error === 'CHECKSUM_ERROR') badChecksums.push(report);
    }
  }

  // Orphaned blobs detection: (future block)
  // You decided to postpone orphaned blob cleanup
  // until system is fully stable.

  return {
    missingFiles,
    orphanedRecords,
    badChecksums,
    ok:
      missingFiles.length === 0 &&
      orphanedRecords.length === 0 &&
      badChecksums.length === 0,
  };
}

/**
 * Repair a missing file → requires staff to upload
 * (UI handles the re-upload logic)
 */
export async function markAsMissing(docId: string) {
  await registry.documents.update({
    where: { id: docId },
    data: { missing: true },
  });
}

/**
 * Utility for converting blob stream to buffer
 */
async function streamToBuffer(readable: any): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    readable.on('data', (d: Uint8Array) => chunks.push(d));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}
