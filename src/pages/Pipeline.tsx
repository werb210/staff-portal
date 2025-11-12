import Card from '../components/Card';
import PipelineBoard from '../components/PipelineBoard';
import { useAppContext } from '../contexts/AppContext';
import { useUpdatePipelineStage } from '../hooks/usePipeline';

export default function Pipeline() {
  const { pipelineStages } = useAppContext();
  const updateStage = useUpdatePipelineStage();

  return (
    <div className="page">
      <Card title="Pipeline">
        <PipelineBoard
          stages={pipelineStages}
          onMove={(applicationId, stageId) => updateStage.mutate({ applicationId, stageId })}
        />
      </Card>
    </div>
  );
}
