import { usePipelineStore } from "@/state/pipelineStore";
import PipelineCard from "./PipelineCard";

type PipelineColumnProps = {
  stageId: string;
  title: string;
};

export default function PipelineColumn({ stageId, title }: PipelineColumnProps) {
  const apps = usePipelineStore((s) => s.byStage(stageId));

  return (
    <div className="w-80 bg-gray-100 rounded-xl p-4 flex flex-col gap-3">
      <div className="font-semibold text-lg pb-2 border-b">{title}</div>

      <div className="flex flex-col gap-3">
        {apps.map((a) => (
          <PipelineCard key={a.id} app={a} />
        ))}
      </div>
    </div>
  );
}
