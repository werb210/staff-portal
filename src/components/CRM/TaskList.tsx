import type { CRMTask } from '../../types/crm';

interface TaskListProps {
  tasks: CRMTask[];
  onComplete?: (taskId: string) => void;
}

const priorityTone: Record<CRMTask['priority'], string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

export function TaskList({ tasks, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-state">No open tasks. Great job staying on top of the pipeline!</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-list__item task-list__item--${priorityTone[task.priority]}`} data-silo={task.silo}>
          <div className="task-list__content">
            <h4>{task.title}</h4>
            {task.description && <p>{task.description}</p>}
            <dl>
              <div>
                <dt>Due</dt>
                <dd>{new Date(task.dueAt).toLocaleString()}</dd>
              </div>
              {task.assignedTo && (
                <div>
                  <dt>Owner</dt>
                  <dd>{task.assignedTo}</dd>
                </div>
              )}
              <div>
                <dt>Status</dt>
                <dd>{task.status}</dd>
              </div>
            </dl>
          </div>
          {onComplete && task.status !== 'completed' && (
            <button className="btn success" onClick={() => onComplete(task.id)} type="button">
              Mark Complete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
