import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  stage: string;
  children: React.ReactNode;
}

export default function ColumnContainer({ stage, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${stage}`,
    data: { stage },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[350px] bg-slate-50 rounded-xl border 
      transition-all 
      ${isOver ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
    >
      {children}
    </div>
  );
}
