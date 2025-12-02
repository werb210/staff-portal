import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { ApplicationCard } from "@/components/pipeline";
import { PipelineApplication } from "../Column";

interface Props {
  children: React.ReactNode;
  apps: PipelineApplication[];
  onDragEnd?: (args: {
    id: string;
    fromStage: string;
    toStage: string;
  }) => void;
}

export default function PipelineDndProvider({
  children,
  apps,
  onDragEnd,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const activeApp = activeId
    ? apps.find((a) => a.id === activeId) || null
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        setActiveId(event.active.id as string);
      }}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (!over) {
          setActiveId(null);
          return;
        }

        const fromStage = active.data?.current?.stage;
        const toStage = over.data?.current?.stage;

        if (fromStage && toStage && fromStage !== toStage) {
          onDragEnd?.({
            id: active.id as string,
            fromStage,
            toStage,
          });
        }

        setActiveId(null);
      }}
    >
      {children}

      {/* Drag Preview */}
      <DragOverlay>
        {activeApp ? (
          <div className="opacity-90 scale-105">
            <ApplicationCard
              id={activeApp.id}
              businessName={activeApp.businessName}
              contactName={activeApp.contactName}
              stage={activeApp.stage}
              score={activeApp.score}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
