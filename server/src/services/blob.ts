// server/src/services/blob.ts
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { getMimeType } from "../utils/mime";

const account = process.env.AZURE_STORAGE_ACCOUNT!;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY!;
const containerName = process.env.AZURE_STORAGE_CONTAINER!;

const credential = new StorageSharedKeyCredential(account, accountKey);
const blobService = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  credential
);

export const containerClient = blobService.getContainerClient(containerName);

/**
 * Build silo-safe path:
 *   e.g.  BF/applications/123/documents/<uuid>.pdf
 */
export function buildBlobPath({
  silo,
  applicationId,
  documentId,
  filename,
}: {
  silo: string;
  applicationId: string;
  documentId: string;
  filename: string;
}) {
  return `${silo}/applications/${applicationId}/documents/${documentId}/${filename}`;
}

/**
 * Upload a file
 */
export async function uploadBlob({
  silo,
  applicationId,
  documentId,
  filename,
  buffer,
}: {
  silo: string;
  applicationId: string;
  documentId: string;
  filename: string;
  buffer: Buffer;
}) {
  const mimeType = getMimeType(filename);
  const blobPath = buildBlobPath({ silo, applicationId, documentId, filename });
  const blockBlob = containerClient.getBlockBlobClient(blobPath);

  try {
    await blockBlob.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
      metadata: {
        silo,
        applicationId,
        documentId,
        filename,
        mimeType,
        uploadedAt: new Date().toISOString(),
      },
    });

    return { blobPath, mimeType };
  } catch (err: any) {
    console.error("❌ Azure upload failed:", err);
    throw new Error("AZURE_UPLOAD_FAILED");
  }
}

/**
 * Retrieve SAS URL for preview/download
 */
export function getDownloadUrl(blobPath: string) {
  try {
    const sas = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse("r"),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
      credential
    ).toString();

    return `https://${account}.blob.core.windows.net/${containerName}/${blobPath}?${sas}`;
  } catch (err: any) {
    console.error("❌ Failed to generate SAS URL:", err);
    throw new Error("AZURE_SAS_FAILED");
  }
}

/**
 * Generate SAS for upload (used in future chunked uploads)
 */
export function getUploadUrl(blobPath: string) {
  try {
    const sas = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse("cw"), // create + write
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
      credential
    ).toString();

    return `https://${account}.blob.core.windows.net/${containerName}/${blobPath}?${sas}`;
  } catch (err: any) {
    console.error("❌ Upload SAS failed:", err);
    throw new Error("AZURE_UPLOAD_SAS_FAILED");
  }
}

/**
 * Check if blob exists
 */
export async function blobExists(blobPath: string) {
  try {
    const blob = containerClient.getBlobClient(blobPath);
    return await blob.exists();
  } catch (_) {
    return false;
  }
}

/**
 * Delete (only used for recovery after version replacement)
 */
export async function deleteBlob(blobPath: string) {
  try {
    const blob = containerClient.getBlobClient(blobPath);
    await blob.deleteIfExists();
  } catch (err: any) {
    console.error("❌ Failed to delete blob:", err);
    throw new Error("AZURE_DELETE_FAILED");
  }
}
