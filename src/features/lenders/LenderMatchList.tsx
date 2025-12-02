import React from "react";
import { LenderMatchCard } from "./LenderMatchCard";

const lenders = [
  {
    id: "l1",
    name: "Maple Bank",
    product: "ABL Revolver",
    rate: "Prime + 4.2%",
    requiredDocs: ["Financials", "A/R aging", "Inventory report"],
    confidence: 86,
    description: "Strong appetite for asset-heavy borrowers with clean aging and stable margins.",
  },
  {
    id: "l2",
    name: "Northern Credit",
    product: "Term Loan",
    rate: "9.5% fixed",
    requiredDocs: ["Tax returns", "NOAs", "Personal statement"],
    confidence: 72,
    description: "Prefers predictable cash flow and owner guarantees for mid-market facilities.",
  },
  {
    id: "l3",
    name: "Prairie Capital",
    product: "Equipment Lease",
    rate: "7.9% fixed",
    requiredDocs: ["Equipment quote", "Bank statements"],
    confidence: 64,
    description: "Lease option for new rolling stock with fast turnaround and minimal covenants.",
  },
];

export default function LenderMatchList() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Lender match</h3>
          <p className="text-sm text-slate-600">Mock recommendations with confidence meter.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Local only</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {lenders.map((lender) => (
          <LenderMatchCard key={lender.id} lender={lender} />
        ))}
      </div>
    </div>
  );
}
