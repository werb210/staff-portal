import fetch from "node-fetch";
import { registry } from "../db/registry.js";
import { uploadBlob } from "./blob.js";
import { calculateSHA256 } from "../utils/checksum.js";
import { wsHub } from "./wsHub.js";

/**
 * SignNow config (all provided via environment variables)
 */
const BASE_URL = process.env.SIGNNOW_BASE_URL!;
const CLIENT_ID = process.env.SIGNNOW_CLIENT_ID!;
const CLIENT_SECRET = process.env.SIGNNOW_CLIENT_SECRET!;
const SIGNING_REDIRECT = process.env.SIGNNOW_REDIRECT_URL!;

/**
 * SignNow uses OAuth to generate an access token
 */
export async function getSignNowToken() {
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) throw new Error("SIGNNOW_AUTH_FAILED");

  const json = await res.json();
  return json.access_token;
}

/**
 * Start a signing session
 */
export async function startSigning(applicationId: string) {
  const app = await registry.applications.findUnique({
    where: { id: applicationId },
  });

  if (!app) throw new Error("APPLICATION_NOT_FOUND");

  const accessToken = await getSignNowToken();

  // Create a blank document template (future: pre-fill)
  const templateRes = await fetch(`${BASE_URL}/document`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!templateRes.ok) throw new Error("SIGNNOW_DOC_CREATE_FAILED");

  const docJson = await templateRes.json();
  const documentId = docJson.id;

  // Generate an invite URL
  const inviteRes = await fetch(`${BASE_URL}/document/${documentId}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: [
        {
          email: app.applicantEmail,
          role_id: "signer",
          order: 1,
        },
      ],
      redirect_uri: SIGNING_REDIRECT,
    }),
  });

  if (!inviteRes.ok) throw new Error("SIGNNOW_INVITE_FAILED");

  const inviteJson = await inviteRes.json();

  // Save signing session
  await registry.signingSessions.create({
    data: {
      applicationId,
      signnowDocumentId: documentId,
      signnowInviteId: inviteJson.id,
      status: "pending",
    },
  });

  return {
    inviteUrl: inviteJson.url,
  };
}

/**
 * Download signed PDF after webhook
 */
export async function downloadSignedPDF(docId: string) {
  const accessToken = await getSignNowToken();

  const res = await fetch(`${BASE_URL}/document/${docId}/download`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("SIGNNOW_DOWNLOAD_FAILED");

  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer;
}

/**
 * Handle webhook callback → download PDF + store in Azure
 */
export async function processSignNowCallback(payload: any) {
  const docId = payload.document_id;
  const session = await registry.signingSessions.findFirst({
    where: { signnowDocumentId: docId },
  });

  if (!session) throw new Error("SIGNING_SESSION_NOT_FOUND");

  const app = await registry.applications.findUnique({
    where: { id: session.applicationId },
  });

  if (!app) throw new Error("APPLICATION_NOT_FOUND");

  // Fetch PDF
  const pdfBuffer = await downloadSignedPDF(docId);
  const sha256 = calculateSHA256(pdfBuffer);

  const filename = `signed_application_${app.id}.pdf`;

  const uploaded = await uploadBlob({
    silo: app.silo,
    applicationId: app.id,
    documentId: docId,
    filename,
    buffer: pdfBuffer,
  });

  // Save in database as signed_application doc
  await registry.documents.create({
    data: {
      id: docId,
      applicationId: app.id,
      silo: app.silo,
      name: filename,
      category: "SIGNED_APPLICATION",
      documentType: "signed_application",
      s3Key: uploaded.blobPath,
      blobPath: uploaded.blobPath,
      checksum: sha256,
      version: 1,
      status: "accepted",
    },
  });

  // Update signing session status
  await registry.signingSessions.update({
    where: { id: session.id },
    data: { status: "completed" },
  });

  // Notify client + staff
  wsHub.emitDocumentUpdate(app.silo, app.id);

  return true;
}
