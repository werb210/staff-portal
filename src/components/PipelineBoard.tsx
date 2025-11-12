import { useState } from 'react';
import type { PipelineStage } from '../utils/types';

interface PipelineBoardProps {
  stages: PipelineStage[];
  onMove: (applicationId: string, stageId: string) => void;
}

export function PipelineBoard({ stages, onMove }: PipelineBoardProps) {
  const [draggedApplicationId, setDraggedApplicationId] = useState<string | null>(null);

  return (
    <div className="pipeline">
      {stages
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((stage) => (
          <section
            key={stage.id}
            className="pipeline__column"
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggedApplicationId) return;
              onMove(draggedApplicationId, stage.id);
              setDraggedApplicationId(null);
            }}
          >
            <header className="pipeline__column-header">
              <h3>{stage.name}</h3>
              <span>{stage.applications.length}</span>
            </header>
            <div className="pipeline__column-body">
              {stage.applications.map((application) => (
                <article
                  key={application.id}
                  className="pipeline__card"
                  draggable
                  onDragStart={() => setDraggedApplicationId(application.id)}
                  onDragEnd={() => setDraggedApplicationId(null)}
                >
                  <h4>{application.applicantName}</h4>
                  <p>{application.product}</p>
                  <small>Updated {new Date(application.updatedAt).toLocaleDateString()}</small>
                </article>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

export default PipelineBoard;
