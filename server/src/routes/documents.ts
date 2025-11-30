import { Router } from 'express';
import multer from 'multer';
import { blobSafe } from '../middleware/blobSafe.js';
import { registry } from '../db/registry.js';
import {
  uploadBlob,
  getDownloadUrl,
  buildBlobPath,
} from '../services/blob';
import { calculateSHA256 } from '../utils/checksum.js';
import { auditApplication, markAsMissing } from '../services/documentIntegrity.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------------------------------
//  GET /documents/application/:id
// ----------------------------------------------------
router.get(
  '/application/:id',
  blobSafe(async (req, res) => {
    const docs = await registry.documents.findMany({
      where: { applicationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(docs);
  })
);

// ----------------------------------------------------
//  GET /documents/:id/view  → SAS URL for preview
// ----------------------------------------------------
router.get(
  '/:id/view',
  blobSafe(async (req, res) => {
    const doc = await registry.documents.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const sasUrl = getDownloadUrl(doc.s3Key || doc.blobPath);
    res.json({ sasUrl });
  })
);

// ----------------------------------------------------
//  POST /documents/:id/accept
// ----------------------------------------------------
router.post(
  '/:id/accept',
  blobSafe(async (req, res) => {
    await registry.documents.update({
      where: { id: req.params.id },
      data: { status: 'accepted' },
    });
    res.json({ ok: true });
  })
);

// ----------------------------------------------------
//  POST /documents/:id/reject
// ----------------------------------------------------
router.post(
  '/:id/reject',
  blobSafe(async (req, res) => {
    const reason = req.body.reason || 'Please upload a new version.';

    const doc = await registry.documents.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        rejectReason: reason,
      },
    });

    // Send SMS via Twilio (future block)
    // sendSmsToApplicant(doc.applicationId, reason);

    res.json({ ok: true });
  })
);

// ----------------------------------------------------
//  POST /documents/:id/upload-version
// ----------------------------------------------------
router.post(
  '/:id/upload-version',
  upload.single('file'),
  blobSafe(async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Missing file upload' });

    const doc = await registry.documents.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const sha = calculateSHA256(file.buffer);
    const filename = file.originalname;

    const blobPath = buildBlobPath({
      silo: doc.silo,
      applicationId: doc.applicationId!,
      documentId: doc.id,
      filename,
    });

    const uploaded = await uploadBlob({
      silo: doc.silo,
      applicationId: doc.applicationId!,
      documentId: doc.id,
      filename,
      buffer: file.buffer,
    });

    // Create version record
    await registry.documentVersions.create({
      data: {
        documentId: doc.id,
        version: doc.version + 1,
        blobPath: uploaded.blobPath,
        mimeType: uploaded.mimeType,
        checksum: sha,
      },
    });

    // Update main document to new version
    await registry.documents.update({
      where: { id: doc.id },
      data: {
        version: doc.version + 1,
        s3Key: uploaded.blobPath,
        blobPath: uploaded.blobPath,
        checksum: sha,
        status: 'pending',
        missing: false,
      },
    });

    res.json({ ok: true });
  })
);

// ----------------------------------------------------
//  GET /documents/:id/versions
// ----------------------------------------------------
router.get(
  '/:id/versions',
  blobSafe(async (req, res) => {
    const versions = await registry.documentVersions.findMany({
      where: { documentId: req.params.id },
      orderBy: { version: 'asc' },
    });

    const withUrls = versions.map((v) => ({
      ...v,
      sasUrl: getDownloadUrl(v.blobPath),
    }));

    res.json(withUrls);
  })
);

// ----------------------------------------------------
//  POST /documents/application/:id/audit
// ----------------------------------------------------
router.post(
  '/application/:id/audit',
  blobSafe(async (req, res) => {
    const result = await auditApplication(req.params.id);
    res.json(result);
  })
);

// ----------------------------------------------------
//  POST /documents/:id/mark-missing
// ----------------------------------------------------
router.post(
  '/:id/mark-missing',
  blobSafe(async (req, res) => {
    await markAsMissing(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
