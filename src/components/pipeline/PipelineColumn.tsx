// src/components/pipeline/PipelineColumn.tsx
import React from 'react';
import { usePipelineStore } from '../../state/pipelineStore';
import ApplicationCard from './ApplicationCard';

export default function PipelineColumn({
  title,
  apps,
}: {
  title: string;
  apps: any[];
}) {
  const move = usePipelineStore((s) => s.move);

  function onDrop(e: React.DragEvent) {
    const appId = e.dataTransfer.getData("appId");
    move(appId, title);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        minWidth: "280px",
        background: "#f1f1f1",
        padding: "10px",
        borderRadius: "6px",
      }}
    >
      <h2>
        {title} ({apps.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {apps.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
