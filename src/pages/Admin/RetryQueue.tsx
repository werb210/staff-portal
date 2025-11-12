import Card from '../../components/Card';
import { Table } from '../../components/Table';
import { useRetryQueue } from '../../hooks/useAdmin';

export default function RetryQueue() {
  const retryQueueQuery = useRetryQueue();

  return (
    <div className="page">
      <Card title="Retry queue">
        <Table
          data={retryQueueQuery.data}
          isLoading={retryQueueQuery.isLoading}
          columns={[
            { key: 'job', header: 'Job' },
            { key: 'attempts', header: 'Attempts' },
            { key: 'status', header: 'Status' },
            {
              key: 'lastAttemptAt',
              header: 'Last attempt',
              render: (item) => new Date(item.lastAttemptAt).toLocaleString()
            }
          ]}
          emptyState="Retry queue is empty"
        />
      </Card>
    </div>
  );
}
