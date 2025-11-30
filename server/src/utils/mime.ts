// server/src/utils/mime.ts

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export function getMimeType(filename: string) {
  const parts = filename.toLowerCase().split(".");
  const ext = parts[parts.length - 1];
  return MIME_MAP[ext] || "application/octet-stream";
}
