import { Droppable } from "@hello-pangea/dnd";
import PipelineCardComponent from "./PipelineCard";
import { Pipeline, PipelineCard, PipelineStage } from "./PipelineTypes";

interface ColumnMeta {
  key: PipelineStage;
  label: string;
}

interface Props {
  pipeline: Pipeline;
  stages: ColumnMeta[];
  onOpen: (applicationId: string) => void;
}

export default function PipelineColumns({ pipeline, stages, onOpen }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4 pr-[540px]">
      {stages.map((stage) => (
        <Droppable droppableId={stage.key} key={stage.key}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-80 min-w-[320px] bg-gray-50 border rounded p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{stage.label}</h2>
                <span className="text-xs text-gray-500">
                  {pipeline[stage.key]?.length ?? 0} card(s)
                </span>
              </div>

              <div className="flex flex-col gap-3 min-h-[120px]">
                {pipeline[stage.key]?.map((card: PipelineCard, idx: number) => (
                  <PipelineCardComponent
                    key={card.id}
                    index={idx}
                    card={card}
                    onOpen={onOpen}
                  />
                ))}
                {provided.placeholder}
                {pipeline[stage.key]?.length === 0 && (
                  <p className="text-sm text-gray-500">No cards yet.</p>
                )}
              </div>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}
