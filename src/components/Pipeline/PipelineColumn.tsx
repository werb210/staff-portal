import type { PipelineStage } from '../../hooks/api/usePipeline';

interface PipelineColumnProps {
  stage: PipelineStage;
}

export default function PipelineColumn({ stage }: PipelineColumnProps) {
  return (
    <div className="pipeline-column">
      <h3>{stage.name}</h3>
      <ul>
        {stage.applications?.map((app) => (
          <li key={app.id}>{app.name}</li>
        ))}
      </ul>
    </div>
  );
}
