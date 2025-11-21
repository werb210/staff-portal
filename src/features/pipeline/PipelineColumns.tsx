import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import PipelineCardComponent from "./PipelineCard";
import { Pipeline, PipelineCard, PipelineStage } from "./PipelineTypes";

interface ColumnMeta {
  key: PipelineStage;
  label: string;
}

interface Props {
  pipeline: Pipeline;
  stages: ColumnMeta[];
  onOpen: (applicationId: string, stage: PipelineStage) => void;
}

export default function PipelineColumns({ pipeline, stages, onOpen }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto p-4">
      {stages.map((stage) => {
        const { setNodeRef, isOver } = useDroppable({ id: stage.key, data: { stage: stage.key } });
        const cards = pipeline[stage.key] ?? [];

        return (
          <div
            key={stage.key}
            ref={setNodeRef}
            className={`bg-gray-50 border rounded p-4 shadow-sm min-h-[240px] flex flex-col gap-3 transition-colors ${
              isOver ? "border-blue-400 bg-blue-50" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-lg font-semibold">{stage.label}</p>
                <p className="text-xs text-slate-500">{cards.length} card(s)</p>
              </div>
            </div>

            <SortableContext
              items={cards.map((card) => card.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {cards.map((card: PipelineCard) => (
                  <PipelineCardComponent
                    key={card.id}
                    card={card}
                    onOpen={(id) => onOpen(id, stage.key)}
                  />
                ))}
                {cards.length === 0 && (
                  <p className="text-sm text-slate-500">No cards yet.</p>
                )}
              </div>
            </SortableContext>
          </div>
        );
      })}
    </div>
  );
}
