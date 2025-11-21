import { Workflow } from "lucide-react";

export default function PipelinePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Workflow className="h-5 w-5 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Pipeline</h1>
      </div>
      <p className="text-sm text-slate-600">
        Pipeline interactions will be restored once the Azure Staff Server exposes the necessary stages
        endpoints.
      </p>
    </div>
  );
}
