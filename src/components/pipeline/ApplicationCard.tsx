import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface Props {
  id: string;
  businessName: string;
  contactName: string;
  stage: string;
  score: number | null;
}

export default function ApplicationCard({
  id,
  businessName,
  contactName,
  stage,
  score,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { stage },
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="bg-white shadow border rounded-xl p-4 cursor-grab active:cursor-grabbing select-none transition"
    >
      <div className="font-semibold text-slate-700">{businessName}</div>
      <div className="text-sm text-slate-500">{contactName}</div>

      {score !== null && (
        <div className="mt-2 text-xs text-slate-400">Score: {score}</div>
      )}
    </div>
  );
}
