import { http } from "./http";

export function runOcr(documentId: string) {
  return http.post(`/api/ocr/extract`, { documentId });
}
