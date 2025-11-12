import { useCRMEntities, type CRMEntity } from '../../hooks/api/useCRM';

export default function CRMTable() {
  const { data: entities, isLoading } = useCRMEntities();
  const rows: CRMEntity[] = entities ?? [];
  if (isLoading) return <p>Loading CRM entities...</p>;

  const handleEdit = (id: string) => {
    console.log('Edit entity', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete entity', id);
  };

  return (
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {rows.map((entity) => (
          <tr key={entity.id}>
            <td>{entity.name}</td>
            <td>{entity.email}</td>
            <td>
              <button onClick={() => handleEdit(entity.id)}>Edit</button>
              <button onClick={() => handleDelete(entity.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
