import { FormEvent, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Table } from '../../components/Table';
import { useTasks, useCreateTask } from '../../hooks/useCRM';

export default function Tasks() {
  const tasksQuery = useTasks();
  const createTask = useCreateTask();
  const [formState, setFormState] = useState({ title: '', dueDate: '', assignee: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTask.mutate({ ...formState, status: 'pending' }, {
      onSuccess: () => setFormState({ title: '', dueDate: '', assignee: '' })
    });
  };

  return (
    <div className="page">
      <div className="grid grid--2">
        <Card title="Tasks">
          <Table
            data={tasksQuery.data}
            isLoading={tasksQuery.isLoading}
            columns={[
              { key: 'title', header: 'Title' },
              { key: 'assignee', header: 'Assignee' },
              { key: 'status', header: 'Status' },
              {
                key: 'dueDate',
                header: 'Due',
                render: (task) => new Date(task.dueDate).toLocaleDateString()
              }
            ]}
            emptyState="No tasks yet"
          />
        </Card>
        <Card title="Create task">
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </label>
            <label>
              Assignee
              <input
                value={formState.assignee}
                onChange={(event) => setFormState((prev) => ({ ...prev, assignee: event.target.value }))}
                required
              />
            </label>
            <label>
              Due date
              <input
                type="date"
                value={formState.dueDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, dueDate: event.target.value }))}
                required
              />
            </label>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? 'Creating…' : 'Create task'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
