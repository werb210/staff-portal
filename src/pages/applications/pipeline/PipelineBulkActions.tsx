import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PipelineApplication, PipelineStage } from "./pipeline.types";
import { evaluateStageTransition, normalizeStageId, sortPipelineStages } from "./pipeline.types";
import { updatePortalApplication } from "@/api/applications";
import { pipelineApi } from "./pipeline.api";

type PipelineBulkActionsProps = {
  selectedCards: PipelineApplication[];
  stages: PipelineStage[];
  onClearSelection: () => void;
};

const resolveNextStage = (card: PipelineApplication, stages: PipelineStage[]) => {
  const orderedStages = sortPipelineStages(stages);
  const normalized = normalizeStageId(card.stage);
  const currentIndex = orderedStages.findIndex((stage) => normalizeStageId(stage.id) === normalized);
  const currentStage = orderedStages[currentIndex];
  if (currentStage?.allowedTransitions?.length) {
    return currentStage.allowedTransitions[0];
  }
  if (currentIndex === -1 || currentIndex >= orderedStages.length - 1) {
    return null;
  }
  return orderedStages[currentIndex + 1]?.id ?? null;
};

const PipelineBulkActions = ({ selectedCards, stages, onClearSelection }: PipelineBulkActionsProps) => {
  const queryClient = useQueryClient();
  const selectedCount = selectedCards.length;

  const stageTransitions = useMemo(
    () =>
      selectedCards.map((card) => {
        const nextStage = resolveNextStage(card, stages);
        const transition = evaluateStageTransition({
          card,
          fromStage: card.stage,
          toStage: nextStage,
          stages
        });
        return { card, nextStage, transition };
      }),
    [selectedCards, stages]
  );

  const stageError = useMemo(() => {
    if (selectedCount === 0) return null;
    const blocked = stageTransitions.find((entry) => !entry.transition.allowed);
    if (!blocked) return null;
    return blocked.transition.reason ?? "One or more selected applications cannot move forward.";
  }, [selectedCount, stageTransitions]);

  const exportMutation = useMutation({
    mutationFn: () => pipelineApi.exportApplications(selectedCards.map((card) => card.id)),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pipeline-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  });

  const stageMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        stageTransitions.map((entry) =>
          entry.nextStage
            ? updatePortalApplication(entry.card.id, { stage: entry.nextStage })
            : Promise.resolve(null)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      onClearSelection();
    }
  });

  if (selectedCount === 0) return null;

  return (
    <div className="pipeline-bulk">
      <div className="pipeline-bulk__summary">
        <strong>{selectedCount}</strong> selected
        <button className="btn btn--ghost" type="button" onClick={onClearSelection}>
          Clear
        </button>
      </div>
      <div className="pipeline-bulk__actions">
        <button className="btn btn--ghost" type="button" onClick={() => exportMutation.mutate()}>
          Export CSV
        </button>
        <button
          className="btn btn--primary"
          type="button"
          disabled={Boolean(stageError) || stageMutation.isPending}
          title={stageError ?? undefined}
          onClick={() => stageMutation.mutate()}
        >
          {stageMutation.isPending ? "Updating…" : "Move to next stage"}
        </button>
        {stageError ? <span className="pipeline-bulk__hint">{stageError}</span> : null}
      </div>
    </div>
  );
};

export default PipelineBulkActions;
