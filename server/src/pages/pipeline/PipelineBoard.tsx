import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";

import Column from "../../components/pipeline/Column";
import ApplicationCard from "../../components/pipeline/ApplicationCard";
import { getPipeline, movePipelineCard } from "../../services/pipeline";

export default function PipelineBoard() {
  const [data, setData] = useState<any>({
    New: [],
    Reviewing: [],
    Docs: [],
    Underwriting: [],
    Approved: [],
    Funded: [],
  });

  const [activeApp, setActiveApp] = useState<any>(null);

  // Load pipeline from API
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getPipeline();
    setData(res);
  };

  // DRAG START
  const onDragStart = (e: DragStartEvent) => {
    const appId = e.active.id;
    const sourceStage = e.active.data.current?.stage;

    const app = data[sourceStage]?.find((x: any) => x.id === appId);
    setActiveApp(app || null);
  };

  // DRAG END
  const onDragEnd = async (e: DragEndEvent) => {
    setActiveApp(null);

    const appId = e.active.id;
    const sourceStage = e.active.data.current?.stage;

    const dropData = e.over?.data?.current;
    const targetStage = dropData?.stage;

    if (!targetStage || sourceStage === targetStage) return;

    // Optimistic UI update
    setData((prev: any) => {
      const newData = { ...prev };

      const card = newData[sourceStage].find((x: any) => x.id === appId);

      newData[sourceStage] = newData[sourceStage].filter(
        (x: any) => x.id !== appId
      );

      newData[targetStage] = [...newData[targetStage], card];

      return newData;
    });

    // Hit API
    try {
      await movePipelineCard(appId, targetStage);
    } catch (err) {
      console.error("Pipeline move error:", err);
      load(); // fallback reload
    }
  };

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-6">
        <Column title="New" stage="New" apps={data.New} />
        <Column title="Reviewing" stage="Reviewing" apps={data.Reviewing} />
        <Column title="Requires Docs" stage="Docs" apps={data.Docs} />
        <Column
          title="Underwriting"
          stage="Underwriting"
          apps={data.Underwriting}
        />
        <Column title="Approved" stage="Approved" apps={data.Approved} />
        <Column title="Funded" stage="Funded" apps={data.Funded} />
      </div>

      <DragOverlay>
        {activeApp ? (
          <ApplicationCard {...activeApp} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
