import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import DragDropCard from '../components/DragDropCard';

type PipelineItem = {
  id: string;
  applicant?: string;
  stage: string;
  amount?: number;
  updated_at?: string;
  [key: string]: unknown;
};

export default function Pipeline() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragged, setDragged] = useState<PipelineItem | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const { data } = await api.get<PipelineItem[]>('/api/pipeline');
        setItems(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      }
    };

    fetchPipeline();
  }, []);

  const stages = useMemo(() => {
    const uniqueStages = Array.from(new Set(items.map((item) => item.stage)));
    if (!uniqueStages.length) {
      return ['Intake', 'Review', 'Underwriting', 'Funding', 'Completed'];
    }
    return uniqueStages;
  }, [items]);

  const handleDrop = (stage: string) => {
    if (dragged) {
      setItems((prev) =>
        prev.map((item) => (item.id === dragged.id ? { ...item, stage } : item))
      );
      setDragged(null);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Pipeline</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Drag and drop applications across workflow stages to align operations and underwriting.
          </p>
        </div>
      </div>
      {error && <div className="card">{error}</div>}
      {!error && items.length === 0 && (
        <div className="card">
          <p>No pipeline items yet. Drag and drop becomes available once applications enter the workflow.</p>
        </div>
      )}
      <div
        className="page-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.max(stages.length, 1)}, minmax(240px, 1fr))`,
          alignItems: 'flex-start'
        }}
      >
        {stages.map((stage) => (
          <div
            key={stage}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(stage)}
            style={{ display: 'grid', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{stage}</h3>
              <span className="status-pill">{items.filter((item) => item.stage === stage).length}</span>
            </div>
            {items
              .filter((item) => item.stage === stage)
              .map((item) => (
                <DragDropCard
                  key={item.id}
                  item={item}
                  getId={(pipelineItem) => pipelineItem.id}
                  onDragStart={(pipelineItem) => setDragged(pipelineItem)}
                  render={(pipelineItem) => (
                    <div>
                      <strong>{pipelineItem.applicant || 'Unknown Applicant'}</strong>
                      <p style={{ margin: '0.25rem 0', color: 'var(--color-muted)' }}>
                        ${Number(pipelineItem.amount || 0).toLocaleString()}
                      </p>
                      <small style={{ color: 'var(--color-muted)' }}>
                        Updated {pipelineItem.updated_at ? new Date(pipelineItem.updated_at).toLocaleString() : 'N/A'}
                      </small>
                    </div>
                  )}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
