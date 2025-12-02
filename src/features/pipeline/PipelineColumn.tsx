import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { PipelineCard } from "./PipelineCard";

export type PipelineColumnData = {
  id: string;
  title: string;
  applications: PipelineCardProps["application"][];
};

type PipelineCardProps = React.ComponentProps<typeof PipelineCard>;

type PipelineColumnProps = {
  column: PipelineColumnData;
  compact?: boolean;
};

export function PipelineColumn({ column, compact = false }: PipelineColumnProps) {
  return (
    <div className="flex h-full min-w-[260px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{column.title}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{column.applications.length}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 p-2 transition ${
              snapshot.isDraggingOver ? "border-indigo-400 bg-indigo-50" : ""
            }`}
          >
            {column.applications.map((application, index) => (
              <Draggable key={application.id} draggableId={application.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={dragSnapshot.isDragging ? "rotate-[-1deg]" : ""}
                  >
                    <PipelineCard application={application} compact={compact} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
