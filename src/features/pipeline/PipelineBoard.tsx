import React, { useMemo, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { PipelineColumn, PipelineColumnData } from "./PipelineColumn";

const initialColumns: PipelineColumnData[] = [
  {
    id: "new",
    title: "New",
    applications: [
      {
        id: "APP-3412",
        applicant: "Jessie Hayes",
        company: "Northwind Coffee Co",
        stage: "Pre-qual",
        amount: "$250,000",
        requiredDocs: ["Bank statements", "Void cheque"],
        updatedAt: "2h ago",
      },
      {
        id: "APP-3413",
        applicant: "Ravi Singh",
        company: "Prairie Freight",
        stage: "Lead",
        amount: "$120,000",
        missingDocs: true,
        updatedAt: "45m ago",
      },
    ],
  },
  {
    id: "requires-docs",
    title: "Requires Docs",
    applications: [
      {
        id: "APP-3390",
        applicant: "Chen Liu",
        company: "Aurora Dental",
        stage: "Document collection",
        amount: "$80,000",
        requiredDocs: ["ID", "Lease", "Insurance"],
        missingDocs: true,
        updatedAt: "1d ago",
      },
    ],
  },
  {
    id: "review",
    title: "Under Review",
    applications: [
      {
        id: "APP-3304",
        applicant: "Maria Santos",
        company: "Sprout Grocers",
        stage: "Analyst review",
        amount: "$410,000",
        requiredDocs: ["P&L", "NOA 2023"],
        updatedAt: "3h ago",
      },
    ],
  },
  {
    id: "missing",
    title: "Missing Docs",
    applications: [
      {
        id: "APP-3288",
        applicant: "Owen Patel",
        company: "Coastal Outfitters",
        stage: "Doc remediation",
        amount: "$190,000",
        missingDocs: true,
        rejectedDocs: 1,
        updatedAt: "5h ago",
      },
    ],
  },
  {
    id: "approved",
    title: "Approved",
    applications: [
      {
        id: "APP-3201",
        applicant: "Harper Lane",
        company: "Cedar Wellness",
        stage: "Funding",
        amount: "$350,000",
        updatedAt: "1d ago",
      },
    ],
  },
];

export default function PipelineBoard() {
  const [columns, setColumns] = useState<PipelineColumnData[]>(initialColumns);
  const [compact, setCompact] = useState(false);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceColIndex = columns.findIndex((col) => col.id === result.source.droppableId);
    const destColIndex = columns.findIndex((col) => col.id === result.destination!.droppableId);
    if (sourceColIndex === -1 || destColIndex === -1) return;

    const updated = [...columns];
    const [moved] = updated[sourceColIndex].applications.splice(result.source.index, 1);
    updated[destColIndex].applications.splice(result.destination.index, 0, moved);
    setColumns(updated);
  };

  const totals = useMemo(
    () =>
      columns.reduce(
        (acc, col) => {
          acc.count += col.applications.length;
          return acc;
        },
        { count: 0 },
      ),
    [columns],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pipeline</h2>
          <p className="text-sm text-slate-600">{totals.count} active applications across all stages.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Compact mode
          </label>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Requires Docs column now tracked
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-flow-col auto-cols-[280px] gap-4 overflow-x-auto pb-2">
          {columns.map((column) => (
            <PipelineColumn key={column.id} column={column} compact={compact} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
