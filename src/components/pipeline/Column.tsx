import React from "react";
import { ApplicationCard, ApplicationCardSkeleton, EmptyColumn } from ".";
import { Card } from "@/components/ui/card";

export interface PipelineApplication {
  id: string;
  businessName: string;
  contactName: string;
  stage: string;
  score?: number | null;
}

interface Props {
  label: string;
  apps: PipelineApplication[];
  loading?: boolean;
  onCardClick?: (id: string) => void;
}

export default function Column({
  label,
  apps,
  loading = false,
  onCardClick,
}: Props) {
  return (
    <div className="flex flex-col h-full w-[320px]">
      {/* Column Header */}
      <div className="px-2 py-3 flex justify-between items-center bg-gray-100 rounded-md border mb-2">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
          {apps.length}
        </span>
      </div>

      {/* Card List */}
      <div className="overflow-y-auto pr-1 flex flex-col gap-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}

        {!loading && apps.length === 0 && <EmptyColumn label={label} />}

        {!loading &&
          apps.map((app) => (
            <div key={app.id}>
              <ApplicationCard
                id={app.id}
                businessName={app.businessName}
                contactName={app.contactName}
                stage={app.stage}
                score={app.score}
                onClick={() => onCardClick?.(app.id)}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
