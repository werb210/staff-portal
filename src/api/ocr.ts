import api from "@/lib/api/client";

export function runOcr(documentId: string) {
  return api.post(`/api/ocr/extract`, { documentId }).then((res) => res.data);
}
