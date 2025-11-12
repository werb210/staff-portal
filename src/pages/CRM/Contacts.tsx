import { FormEvent, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Table } from '../../components/Table';
import { useContacts, useCreateContact } from '../../hooks/useCRM';

export default function Contacts() {
  const contactsQuery = useContacts();
  const createContact = useCreateContact();
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createContact.mutate(formState, {
      onSuccess: () => setFormState({ name: '', email: '', phone: '' })
    });
  };

  return (
    <div className="page">
      <div className="grid grid--2">
        <Card title="Contacts">
          <Table
            data={contactsQuery.data}
            isLoading={contactsQuery.isLoading}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'phone', header: 'Phone' },
              {
                key: 'createdAt',
                header: 'Created',
                render: (contact) => new Date(contact.createdAt).toLocaleDateString()
              }
            ]}
            emptyState="No contacts yet"
          />
        </Card>
        <Card title="Create contact">
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>
            <Button type="submit" disabled={createContact.isPending}>
              {createContact.isPending ? 'Creating…' : 'Create contact'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
