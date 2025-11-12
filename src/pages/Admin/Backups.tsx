import Card from '../../components/Card';
import { Table } from '../../components/Table';
import { useBackups } from '../../hooks/useAdmin';

export default function Backups() {
  const backupsQuery = useBackups();

  return (
    <div className="page">
      <Card title="Backups">
        <Table
          data={backupsQuery.data}
          isLoading={backupsQuery.isLoading}
          columns={[
            { key: 'id', header: 'Backup ID' },
            {
              key: 'createdAt',
              header: 'Created',
              render: (backup) => new Date(backup.createdAt).toLocaleString()
            },
            {
              key: 'sizeMb',
              header: 'Size',
              render: (backup) => `${backup.sizeMb} MB`
            },
            { key: 'location', header: 'Location' }
          ]}
          emptyState="No backups available"
        />
      </Card>
    </div>
  );
}
