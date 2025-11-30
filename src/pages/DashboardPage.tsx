// src/pages/DashboardPage.tsx
import React from 'react';
import PipelineBoard from '../components/pipeline/PipelineBoard';

export default function DashboardPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Pipeline Overview</h1>
      <PipelineBoard />
    </div>
  );
}
