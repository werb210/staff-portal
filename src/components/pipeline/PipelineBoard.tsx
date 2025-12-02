import { useEffect } from "react";
import PipelineColumn from "./PipelineColumn";
import { usePipelineStore } from "@/state/pipelineStore";

const stages = [
  { id: "new", title: "New" },
  { id: "requires-docs", title: "Requires Docs" },
  { id: "in-review", title: "In Review" },
  { id: "submitted", title: "Submitted" },
  { id: "approved", title: "Approved" },
  { id: "funded", title: "Funded" },
];

export default function PipelineBoard() {
  const load = usePipelineStore((s) => s.loadPipeline);
  const loading = usePipelineStore((s) => s.loading);

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 w-full overflow-x-auto h-full">
      <div className="flex gap-4 min-w-max h-full">
        {stages.map((s) => (
          <PipelineColumn key={s.id} stageId={s.id} title={s.title} />
        ))}
      </div>

      {loading && <div className="mt-4 text-sm text-gray-600">Loading…</div>}
    </div>
  );
}
