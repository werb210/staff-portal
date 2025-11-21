import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ApplicationDrawer from "../applications/ApplicationDrawer";
import { getPipeline, moveCard } from "./PipelineService";
import { Pipeline, PipelineCard, PipelineStage } from "./PipelineTypes";
import PipelineColumns from "./PipelineColumns";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";

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
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | undefined>();

  const { data, isLoading, isError, error, refetch } = useQuery({
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
        const updated: Pipeline = STAGES.reduce<Pipeline>((acc, stage) => {
          acc[stage.key] = [...(previous[stage.key] ?? [])];
          return acc;
        }, { ...EMPTY_PIPELINE });
        let movingCard: PipelineCard | null = null;

        STAGES.forEach((stage) => {
          const cards = updated[stage.key] ?? [];
          const index = cards.findIndex((c) => c.id === cardId);
          if (index !== -1) {
            const [removed] = cards.splice(index, 1);
            movingCard = removed;
          }
        });

        if (movingCard) {
          updated[toStage] = [
            { ...movingCard, stage: toStage },
            ...(updated[toStage] ?? []),
          ];
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

  function enforceDocumentRules(card: PipelineCard, desired: PipelineStage) {
    const docs = card.documents ?? [];
    const hasRejected = docs.some((doc) => doc.status === "rejected");
    const hasDocs = docs.length > 0;

    if (!hasDocs || hasRejected) {
      return "requires_docs" as PipelineStage;
    }

    return desired;
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromStage = source.droppableId as PipelineStage;
    const toStage = destination.droppableId as PipelineStage;

    if (fromStage === toStage && destination.index === source.index) return;

    const current = queryClient.getQueryData<Pipeline>(["pipeline"]);
    if (!current) return;

    const card = current[fromStage]?.find((c) => c.id === draggableId);
    if (!card) return;

    const finalStage = enforceDocumentRules(card, toStage);
    const optimistic: Pipeline = STAGES.reduce<Pipeline>((acc, stage) => {
      acc[stage.key] = [...(current[stage.key] ?? [])];
      return acc;
    }, { ...EMPTY_PIPELINE });

    const [removed] = optimistic[fromStage].splice(source.index, 1);
    optimistic[finalStage].splice(destination.index, 0, {
      ...removed,
      stage: finalStage,
    });

    queryClient.setQueryData(["pipeline"], optimistic);

    moveMutation.mutate({ cardId: draggableId, toStage: finalStage }, {
      onError: () => {
        queryClient.setQueryData(["pipeline"], current);
      },
    });
  }

  if (isLoading) {
    return <LoadingState label="Loading pipeline" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} message={`Failed to load pipeline: ${String(error)}`} />;
  }

  return (
    <div className="relative">
      <DragDropContext onDragEnd={handleDragEnd}>
        <PipelineColumns
          pipeline={pipeline}
          stages={STAGES}
          onOpen={(id, stage) => {
            setSelectedStage(stage as PipelineStage);
            setSelectedAppId(id);
          }}
        />
      </DragDropContext>

      {selectedAppId && (
        <ApplicationDrawer
          appId={selectedAppId}
          open={Boolean(selectedAppId)}
          onClose={() => setSelectedAppId(null)}
          stage={selectedStage}
        />
      )}
    </div>
  );
}
