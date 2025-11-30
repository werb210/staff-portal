// src/components/pipeline/PipelineBoard.tsx
import React, { useEffect } from 'react';
import PipelineColumn from './PipelineColumn';
import { usePipelineStore } from '../../state/pipelineStore';

const STAGES = [
  "Not Submitted",
  "Received",
  "In Review",
  "Documents Required",
  "Ready for Signing",
  "Off to Lender",
  "Offer",
];

export default function PipelineBoard() {
  const { stages, load } = usePipelineStore();

  useEffect(() => {
    load();

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        if (data.type === "pipeline-update") {
          load();
        }
      } catch (_) {}
    };

    return () => ws.close();
  }, [load]);

  return (
    <div style={{ display: "flex", gap: "20px", overflowX: "auto" }}>
      {STAGES.map((stage) => (
        <PipelineColumn key={stage} title={stage} apps={stages[stage]} />
      ))}
    </div>
  );
}
