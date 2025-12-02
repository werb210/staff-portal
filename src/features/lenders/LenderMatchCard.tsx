import React, { useState } from "react";
import { cn } from "../../lib/utils";

type LenderMatch = {
  id: string;
  name: string;
  product: string;
  rate: string;
  requiredDocs: string[];
  confidence: number;
  description: string;
};

type LenderMatchCardProps = {
  lender: LenderMatch;
};

export function LenderMatchCard({ lender }: LenderMatchCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-700">
            {lender.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-900">{lender.name}</h4>
            <p className="text-sm text-slate-600">{lender.product}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-indigo-700">{lender.rate}</div>
          <div className="text-xs text-slate-500">Rate estimate</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <div className="h-2 flex-1 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${lender.confidence}%` }} />
        </div>
        <span className="text-xs font-semibold text-emerald-700">{lender.confidence}% match</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        {lender.requiredDocs.map((doc) => (
          <span key={doc} className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
            {doc}
          </span>
        ))}
      </div>

      {open && <p className="mt-3 text-sm text-slate-700">{lender.description}</p>}

      <div className="mt-4 flex items-center justify-between">
        <button className="text-sm font-semibold text-indigo-600" onClick={() => setOpen((p) => !p)}>
          {open ? "Collapse" : "Expand"} details
        </button>
        <button className={cn("rounded-md px-3 py-2 text-sm font-semibold", "bg-slate-200 text-slate-500", "cursor-not-allowed")}>Send (disabled)</button>
      </div>
    </div>
  );
}
