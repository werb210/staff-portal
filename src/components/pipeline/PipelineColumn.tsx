import type React from "react";
import { PipelineApp } from "../../api/pipeline";
import PipelineCard from "./PipelineCard";

interface Props {
  label: string;
  stage: string;
  apps: PipelineApp[];
  onDropCard: (id: string, stage: string) => void;
  onOpen: (id: string) => void;
}

export default function PipelineColumn({
  label,
  stage,
  apps,
  onDropCard,
  onOpen,
}: Props) {
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropCard(id, stage);
  };

  return (
    <div
      style={{
        flex: 1,
        padding: 10,
        background: "#f4f4f4",
        borderRadius: 6,
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{label}</div>

      {apps.map((a) => (
        <div
          key={a.id}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)}
        >
          <PipelineCard app={a} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}
