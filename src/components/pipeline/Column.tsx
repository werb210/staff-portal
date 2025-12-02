import React from "react";
import ColumnContainer from "./ColumnContainer";
import { ApplicationCard } from "./index";

export interface PipelineApplication {
  id: string;
  businessName: string;
  contactName: string;
  stage: string;
  score: number | null;
}

interface Props {
  title: string;
  stage: string;
  apps: PipelineApplication[];
}

export default function Column({ title, stage, apps }: Props) {
  return (
    <ColumnContainer stage={stage}>
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-700">{title}</h2>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {apps.length === 0 ? (
          <div className="text-slate-400 text-sm italic">No applications</div>
        ) : (
          apps.map((app) => (
            <ApplicationCard
              key={app.id}
              {...app}
            />
          ))
        )}
      </div>
    </ColumnContainer>
  );
}
