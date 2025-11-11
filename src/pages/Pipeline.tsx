import { FC } from 'react';
import { useApiData } from '../hooks/useApiData';
import '../styles/layout.css';

type PipelineStage = {
  name: string;
  count: number;
};

type PipelineResponse = {
  stages: PipelineStage[];
};

const Pipeline: FC = () => {
  const { data, loading, error } = useApiData<PipelineResponse>('/pipeline', {
    stages: [],
  });

  return (
    <section className="page-card">
      <h2>Pipeline</h2>
      <p>Monitor loan progress across your workflow.</p>
      {loading && <p>Loading pipeline…</p>}
      {error && <p role="alert">Failed to load pipeline: {error}</p>}
      {!loading && data && (
        <ul>
          {data.stages.length === 0 && <li>No loans in pipeline.</li>}
          {data.stages.map((stage) => (
            <li key={stage.name}>
              <strong>{stage.name}</strong> — {stage.count} loans
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Pipeline;
