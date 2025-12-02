import { useEffect } from "react";
import { usePipelineStore } from "@/state/pipelineStore";
import PipelineColumn from "@/components/pipeline/PipelineColumn";

const stages = [
  { id: "new", title: "New" },
  { id: "requires-docs", title: "Requires Docs" },
  { id: "in-review", title: "In Review" },
  { id: "submitted", title: "Submitted" },
  { id: "approved", title: "Approved" },
  { id: "funded", title: "Funded" },
];

export default function Pipeline() {
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

      {loading && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded">
          Loading…
        </div>
      )}
    </div>
  );
}
