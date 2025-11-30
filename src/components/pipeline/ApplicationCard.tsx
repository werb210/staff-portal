// src/components/pipeline/ApplicationCard.tsx
import React from 'react';

export default function ApplicationCard({ app }: any) {
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("appId", app.id);
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        padding: "10px",
        background: "white",
        borderRadius: "6px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        cursor: "grab",
      }}
    >
      <strong>{app.businessName}</strong>
      <div>{app.applicantName}</div>
      <div>Requested: ${app.requestedAmount}</div>
    </div>
  );
}
