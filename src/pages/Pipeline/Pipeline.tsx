import PipelineBoard from '../../components/Pipeline/PipelineBoard';
import { useRBAC } from '../../hooks/useRBAC';
import { getPipelineStagesForSilo } from '../../config/rbac';

export default function PipelinePage() {
  const { user } = useRBAC();
  const expectedStages = user ? getPipelineStagesForSilo(user.silo) : [];

  return (
    <div className="page pipeline">
      <section className="card">
        <header className="card__header">
          <h2>{user?.silo} Pipeline</h2>
          <span>Drag applications between stages to trigger transitions.</span>
        </header>
        <PipelineBoard />
      </section>
      <section className="card">
        <header className="card__header">
          <h2>Silo Stage Definitions</h2>
        </header>
        <ul className="list-inline">
          {expectedStages.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
          {expectedStages.length === 0 && <li>BI pipeline coming soon.</li>}
        </ul>
      </section>
    </div>
  );
}
