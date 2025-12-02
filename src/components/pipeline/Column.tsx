import React from "react";
import { useDroppable } from "@dnd-kit/core";
import ApplicationCard from "./ApplicationCard";

interface Props {
  title: string;
  stage: string;
  apps: any[];
}

export default function Column({ title, stage, apps }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${stage}`,
    data: { stage },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-lg border p-4 transition-colors ${
        isOver ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-300"
      }`}
    >
      <h2 className="font-bold text-lg mb-3">{title}</h2>

      <div className="flex flex-col gap-3">
        {apps.map((app: any) => (
          <ApplicationCard key={app.id} {...app} stage={stage} />
        ))}
      </div>
    </div>
  );
}
