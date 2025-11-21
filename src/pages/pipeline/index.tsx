import PipelineBoard from "./PipelineBoard";

export default function PipelinePage() {
  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sales Pipeline</h1>
        <p className="text-sm text-slate-600">Track applications across each stage.</p>
      </div>
      <PipelineBoard />
    </div>
  );
}
