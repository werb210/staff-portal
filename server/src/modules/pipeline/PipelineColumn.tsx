import { Droppable } from "react-beautiful-dnd";

import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { PipelineStage } from "./pipeline.api";
import { PipelineCard } from "./PipelineCard";

type PipelineColumnProps = {
  stage: PipelineStage;
};

export function PipelineColumn({ stage }: PipelineColumnProps) {
  return (
    <Droppable droppableId={stage.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "flex min-h-[260px] flex-col gap-3 rounded-xl border border-slate-200 bg-white/60 p-3 shadow-sm backdrop-blur",
            snapshot.isDraggingOver && "border-indigo-200 bg-indigo-50/70 shadow"
          )}
        >
          <header className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/80 px-3 py-2">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-800">{stage.name}</p>
              <p className="text-xs text-slate-500">Drag applications to update progress</p>
            </div>
            <Badge variant="outline">{stage.applications.length}</Badge>
          </header>
          <div className="flex flex-1 flex-col gap-3">
            {stage.applications.map((application, index) => (
              <PipelineCard key={application.id} application={application} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
