import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveApplication } from "@/lib/api/pipeline";

type MoveInput = { appId: string; toStageId: string };

export function useMove() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, toStageId }: MoveInput) => moveApplication(appId, toStageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline"] });
    }
  });
}
