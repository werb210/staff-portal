import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runOcr } from "../api/ocr";

export function useRunOcr(documentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => runOcr(documentId),
    onSuccess: () => {
      qc.invalidateQueries(["ocr", documentId]);
      qc.invalidateQueries(["documents"]);
    },
  });
}
