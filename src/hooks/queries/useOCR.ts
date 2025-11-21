import { useMutation } from "@tanstack/react-query";
import { OCRAPI } from "../../services";

export function useOCRExtract() {
  return useMutation({
    mutationFn: (file: File) => OCRAPI.extract(file).then(r => r.data),
  });
}
