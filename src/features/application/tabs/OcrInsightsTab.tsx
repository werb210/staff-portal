import React, { useMemo, useState } from "react";
import { cn } from "../../../lib/utils";

const mockInsights = [
  {
    id: "bank",
    title: "Bank Statements",
    fields: [
      { field: "Account Name", extracted: "Northwind Coffee Co", provided: "Northwind Coffee Co" },
      { field: "Average Balance", extracted: "$45,200", provided: "$44,900" },
      { field: "NSF Count", extracted: "0", provided: "0" },
      { field: "Last Deposit", extracted: "Oct 12, 2024", provided: "Oct 12, 2024" },
    ],
  },
  {
    id: "financials",
    title: "Financial Statements",
    fields: [
      { field: "Revenue", extracted: "$1.2M", provided: "$1.18M" },
      { field: "Net Income", extracted: "$240k", provided: "$225k" },
      { field: "EBITDA Margin", extracted: "21%", provided: "20%" },
      { field: "Cash on Hand", extracted: "$180k", provided: "$180k" },
    ],
  },
  {
    id: "id",
    title: "ID Verification",
    fields: [
      { field: "Name", extracted: "Jessie Hayes", provided: "Jessie Hayes" },
      { field: "DOB", extracted: "1990-04-12", provided: "1990-04-12" },
      { field: "Expiry", extracted: "2029-09-30", provided: "2029-09-30" },
      { field: "Address", extracted: "23 Pinecrest Rd", provided: "25 Pinecrest Rd" },
    ],
  },
  {
    id: "tax",
    title: "Tax Returns",
    fields: [
      { field: "Tax Year", extracted: "2023", provided: "2023" },
      { field: "Gross Income", extracted: "$1.05M", provided: "$1.05M" },
      { field: "Taxes Owed", extracted: "$180k", provided: "$175k" },
      { field: "Filing Status", extracted: "Filed", provided: "Filed" },
    ],
  },
  {
    id: "contracts",
    title: "Contracts",
    fields: [
      { field: "Client", extracted: "Prairie Logistics", provided: "Prairie Logistics" },
      { field: "Term", extracted: "24 months", provided: "24 months" },
      { field: "Renewal", extracted: "Auto-renew", provided: "Auto-renew" },
      { field: "Value", extracted: "$480k", provided: "$480k" },
    ],
  },
  {
    id: "others",
    title: "Other Docs",
    fields: [
      { field: "Insurance", extracted: "Valid", provided: "Valid" },
      { field: "Void Cheque", extracted: "Attached", provided: "Attached" },
      { field: "Utility Bill", extracted: "Sep 2024", provided: "Sep 2024" },
      { field: "Lease", extracted: "Expires 2027", provided: "Expires 2028" },
    ],
  },
];

export default function OcrInsightsTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  const toggleGroup = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredGroups = useMemo(() => {
    if (!query) return mockInsights;
    return mockInsights
      .map((group) => ({
        ...group,
        fields: group.fields.filter((f) => f.field.toLowerCase().includes(query.toLowerCase())),
      }))
      .filter((group) => group.fields.length > 0);
  }, [query]);

  const conflict = (extracted: string, provided: string) => extracted !== provided;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">OCR Insights</h3>
            <p className="text-sm text-slate-600">Compare extracted fields against provided declarations.</p>
          </div>
          <input
            type="search"
            placeholder="Search fields"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredGroups.map((group) => {
            const isOpen = expanded[group.id] ?? true;
            return (
              <div key={group.id} className="rounded-lg border border-slate-200 bg-slate-50/60">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
                >
                  <span>{group.title}</span>
                  <span className="text-xs text-indigo-600">{isOpen ? "Collapse" : "Expand"}</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-slate-200">
                    {group.fields.map((row) => {
                      const hasConflict = conflict(row.extracted, row.provided);
                      return (
                        <div
                          key={row.field}
                          className={cn("grid grid-cols-3 gap-2 px-4 py-3 text-sm", {
                            "bg-rose-50 text-rose-700": hasConflict,
                          })}
                        >
                          <div className="font-medium">{row.field}</div>
                          <div>
                            <div className="text-xs uppercase text-slate-500">Extracted</div>
                            <div>{row.extracted}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase text-slate-500">Provided</div>
                            <div>{row.provided}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
