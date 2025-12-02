import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface Props {
  id: string;
  businessName: string;
  stage: string;
}

export default function ApplicationCard({ id, businessName, stage }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { id, stage },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing select-none p-4 rounded-lg shadow bg-white border hover:shadow-md transition-all"
    >
      <div className="font-semibold">{businessName}</div>
      <div className="text-sm text-gray-500 mt-1">Stage: {stage}</div>
    </div>
  );
}
