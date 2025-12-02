import React from "react";
import { cn } from "../../lib/utils";

type PipelineCardProps = {
  application: {
    id: string;
    applicant: string;
    amount: string;
    company: string;
    stage: string;
    missingDocs?: boolean;
    rejectedDocs?: number;
    requiredDocs?: string[];
    updatedAt: string;
  };
  compact?: boolean;
};

const badgeBase =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

export function PipelineCard({ application, compact = false }: PipelineCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
        compact && "p-3 text-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{application.company}</p>
          <h4 className="text-lg font-semibold text-slate-900">{application.applicant}</h4>
          <p className="text-sm text-slate-600">{application.stage}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-indigo-600">{application.amount}</p>
          <p className="text-xs text-slate-500">Updated {application.updatedAt}</p>
        </div>
      </div>

      {application.requiredDocs && application.requiredDocs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {application.requiredDocs.map((doc) => (
            <span key={doc} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {doc}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {application.missingDocs && (
          <span className={cn(badgeBase, "border-amber-200 bg-amber-50 text-amber-700")}>Missing docs</span>
        )}
        {application.rejectedDocs ? (
          <span className={cn(badgeBase, "border-rose-200 bg-rose-50 text-rose-700")}>Rejected docs: {application.rejectedDocs}</span>
        ) : null}
        <span className={cn(badgeBase, "border-slate-200 bg-slate-50 text-slate-700")}>ID {application.id}</span>
      </div>
    </div>
  );
}
