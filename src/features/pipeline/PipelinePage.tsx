import PipelineBoard from "./PipelineBoard";

export default function PipelinePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600">Track applications as they move toward funding.</p>
        </div>
      </div>

      <PipelineBoard />
    </div>
  );
}
