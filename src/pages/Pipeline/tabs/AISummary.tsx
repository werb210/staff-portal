import { usePipelineAISummary } from '../../../hooks/usePipeline';
import { Spinner } from '../../../components/common/Spinner';

interface AISummaryProps {
  applicationId: string;
}

const AISummary = ({ applicationId }: AISummaryProps) => {
  const { data, isLoading } = usePipelineAISummary(applicationId);

  if (isLoading) {
    return <Spinner />;
  }

  if (!data) {
    return <p>No AI insights available.</p>;
  }

  return (
    <div className="tab-panel">
      <h3>AI Summary</h3>
      <p>{data.summary ?? 'AI did not return a summary.'}</p>
      {data.riskAssessment && (
        <div className="card">
          <h4>Risk Assessment</h4>
          <p>{data.riskAssessment}</p>
        </div>
      )}
    </div>
  );
};

export default AISummary;
