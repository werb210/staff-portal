import { FormEvent, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Table } from '../../components/Table';
import { useCompanies, useCreateCompany } from '../../hooks/useCRM';

export default function Companies() {
  const companiesQuery = useCompanies();
  const createCompany = useCreateCompany();
  const [formState, setFormState] = useState({ name: '', industry: '', website: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createCompany.mutate(formState, {
      onSuccess: () => setFormState({ name: '', industry: '', website: '' })
    });
  };

  return (
    <div className="page">
      <div className="grid grid--2">
        <Card title="Companies">
          <Table
            data={companiesQuery.data}
            isLoading={companiesQuery.isLoading}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'industry', header: 'Industry' },
              { key: 'website', header: 'Website' },
              {
                key: 'createdAt',
                header: 'Created',
                render: (company) => new Date(company.createdAt).toLocaleDateString()
              }
            ]}
            emptyState="No companies yet"
          />
        </Card>
        <Card title="Create company">
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
              Industry
              <input
                value={formState.industry}
                onChange={(event) => setFormState((prev) => ({ ...prev, industry: event.target.value }))}
              />
            </label>
            <label>
              Website
              <input
                value={formState.website}
                onChange={(event) => setFormState((prev) => ({ ...prev, website: event.target.value }))}
              />
            </label>
            <Button type="submit" disabled={createCompany.isPending}>
              {createCompany.isPending ? 'Creating…' : 'Create company'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
