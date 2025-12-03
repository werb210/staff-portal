import { usePipeline } from "@/features/pipeline/hooks/usePipeline";
import { useMove } from "@/features/pipeline/hooks/useMove";
import { PipelineStage } from "@/lib/api/pipeline";
import { Link } from "react-router-dom";

export default function PipelinePage() {
  const { data, isLoading, error } = usePipeline();
  const move = useMove();

  if (isLoading) return <p className="p-4">Loading pipeline…</p>;
  if (error) return <p className="p-4 text-red-600">Failed to load pipeline.</p>;

  const stages: PipelineStage[] = data?.stages || [];

  return (
    <div className="p-6 flex gap-4 overflow-x-auto">
      {stages.map((stage) => (
        <div key={stage.id} className="bg-gray-100 p-4 rounded w-72">
          <h2 className="text-xl font-semibold mb-4">{stage.name}</h2>

          {stage.applications.map((app) => (
            <div
              key={app.id}
              className="bg-white shadow p-3 mb-3 rounded border"
            >
              <p className="font-semibold">{app.businessName}</p>
              <p className="text-sm">#{app.id}</p>

              <div className="mt-2 flex gap-2">
                <Link
                  to={`/applications/${app.id}`}
                  className="text-blue-600 underline"
                >
                  View
                </Link>

                <select
                  className="border p-1 text-sm"
                  onChange={(e) =>
                    move.mutate({ appId: app.id, toStageId: e.target.value })
                  }
                >
                  <option>Move to…</option>
                  {stages
                    .filter((s) => s.id !== stage.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
