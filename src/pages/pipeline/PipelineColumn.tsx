import { Droppable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import PipelineCard from "./PipelineCard";
import { PipelineCard as PipelineCardType, PipelineStage } from "@/features/pipeline/PipelineTypes";

interface PipelineColumnProps {
  stage: PipelineStage;
  applications: PipelineCardType[];
  onOpen: (applicationId: string) => void;
}

export default function PipelineColumn({ stage, applications, onOpen }: PipelineColumnProps) {
  return (
    <Droppable droppableId={stage.id}>
      {(provided) => (
        <Card className="flex h-full w-80 min-w-[20rem] flex-col shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">{stage.name}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {applications.length}
            </span>
          </div>
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 min-h-[180px]"
          >
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500">No applications</p>
            ) : (
              applications.map((application, index) => (
                <PipelineCard key={application.id} application={application} index={index} onOpen={onOpen} />
              ))
            )}
            {provided.placeholder}
          </div>
        </Card>
      )}
    </Droppable>
  );
}
