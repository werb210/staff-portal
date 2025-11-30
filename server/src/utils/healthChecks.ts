import { registry } from '../db/registry';
import { BlobServiceClient } from '@azure/storage-blob';

export async function buildHealthResponse() {
  const checks: any = {
    db: false,
    blob: false,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  // DB
  try {
    await registry.$client.query('SELECT 1');
    checks.db = true;
  } catch (_) {
    checks.db = false;
  }

  // Blob storage
  try {
    const client = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const container = client.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER!
    );
    await container.getProperties();
    checks.blob = true;
  } catch (_) {
    checks.blob = false;
  }

  const ok = checks.db && checks.blob;

  return { ok, ...checks };
}
