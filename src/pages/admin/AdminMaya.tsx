import MayaMetrics from "@/components/MayaMetrics";

function MayaSettings() {
  return <div className="rounded border border-slate-200 p-4">MayaSettings</div>;
}

function DriftMonitor() {
  return <div className="rounded border border-slate-200 p-4">DriftMonitor</div>;
}

function PerformanceDashboard() {
  return <div className="rounded border border-slate-200 p-4">PerformanceDashboard</div>;
}

export default function AdminMaya() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Maya System Controls</h1>
      <MayaSettings />
      <DriftMonitor />
      <PerformanceDashboard />
      <MayaMetrics />
    </div>
  );
}
