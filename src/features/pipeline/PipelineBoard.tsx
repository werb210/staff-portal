import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getPipeline, moveCard } from "./PipelineService";
import { Pipeline, PipelineCard, PipelineStage } from "./PipelineTypes";
import PipelineCardComponent from "./PipelineCard";

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: "requires_docs", label: "Requires Docs" },
  { key: "review", label: "Review" },
  { key: "ready_for_lender", label: "Ready for Lender" },
  { key: "submitted", label: "Submitted" },
  { key: "funded", label: "Funded" },
];

const EMPTY_PIPELINE: Pipeline = {
  requires_docs: [],
  review: [],
  ready_for_lender: [],
  submitted: [],
  funded: [],
};

function normalizePipeline(data?: Pipeline | null): Pipeline {
  if (!data) return EMPTY_PIPELINE;

  return STAGES.reduce<Pipeline>((acc, stage) => {
    acc[stage.key] = data[stage.key] ?? [];
    return acc;
  }, { ...EMPTY_PIPELINE });
}

export default function PipelineBoard() {
  const queryClient = useQueryClient();
  const [draggingCard, setDraggingCard] = useState<PipelineCard | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pipeline"],
    queryFn: getPipeline,
    refetchInterval: 5000,
  });

  const pipeline = useMemo(() => normalizePipeline(data), [data]);

  const moveMutation = useMutation({
    mutationFn: ({ cardId, toStage }: { cardId: string; toStage: PipelineStage }) =>
      moveCard(cardId, toStage),
    onMutate: async ({ cardId, toStage }) => {
      await queryClient.cancelQueries({ queryKey: ["pipeline"] });
      const previous = queryClient.getQueryData<Pipeline>(["pipeline"]);

      if (previous) {
        let movingCard: PipelineCard | null = null;
        const updated = STAGES.reduce<Pipeline>((acc, stage) => {
          const cards = previous[stage.key] ?? [];
          const filtered = cards.filter((c) => {
            if (c.id === cardId) {
              movingCard = { ...c, stage: toStage };
              return false;
            }
            return true;
          });
          acc[stage.key] = filtered;
          return acc;
        }, { ...EMPTY_PIPELINE });

        if (movingCard) {
          updated[toStage] = [movingCard, ...updated[toStage]];
        }

        queryClient.setQueryData(["pipeline"], updated);
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["pipeline"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });

  async function handleDrop(stage: PipelineStage) {
    if (!draggingCard || draggingCard.stage === stage) return;

    moveMutation.mutate({ cardId: draggingCard.id, toStage: stage });
    setDraggingCard(null);
  }

  if (isLoading) {
    return <p>Loading pipeline…</p>;
  }

  if (isError) {
    return <p className="text-red-600">Failed to load pipeline: {String(error)}</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {STAGES.map((stage) => (
        <div
          key={stage.key}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(stage.key)}
          className="w-80 min-w-[320px] bg-gray-50 border rounded p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{stage.label}</h2>
            <span className="text-xs text-gray-500">
              {pipeline[stage.key]?.length ?? 0} card(s)
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {pipeline[stage.key]?.map((card) => (
              <PipelineCardComponent
                key={card.id}
                card={card}
                onDragStart={setDraggingCard}
              />
            ))}
            {pipeline[stage.key]?.length === 0 && (
              <p className="text-sm text-gray-500">No cards yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
