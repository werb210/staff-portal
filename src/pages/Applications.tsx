import { FormEvent, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Table } from '../components/Table';
import { useAppContext } from '../contexts/AppContext';
import { useSubmitApplication } from '../hooks/useApplications';

export default function Applications() {
  const { applications } = useAppContext();
  const submitApplication = useSubmitApplication();
  const [formState, setFormState] = useState({ applicantName: '', product: '', amount: 0 });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitApplication.mutate(formState, {
      onSuccess: () => {
        setFormState({ applicantName: '', product: '', amount: 0 });
      }
    });
  };

  return (
    <div className="page">
      <div className="grid grid--2">
        <Card title="Submit new application">
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Applicant name
              <input
                name="applicantName"
                required
                value={formState.applicantName}
                onChange={(event) => setFormState((prev) => ({ ...prev, applicantName: event.target.value }))}
              />
            </label>
            <label>
              Product
              <input
                name="product"
                required
                value={formState.product}
                onChange={(event) => setFormState((prev) => ({ ...prev, product: event.target.value }))}
              />
            </label>
            <label>
              Amount
              <input
                name="amount"
                type="number"
                min={0}
                required
                value={formState.amount || ''}
                onChange={(event) => setFormState((prev) => ({ ...prev, amount: Number(event.target.value) }))}
              />
            </label>
            <Button type="submit" disabled={submitApplication.isPending}>
              {submitApplication.isPending ? 'Submitting…' : 'Submit application'}
            </Button>
          </form>
        </Card>
        <Card title="Summary">
          <p>Total applications: {applications.length}</p>
          <p>Completed: {applications.filter((application) => application.status === 'completed').length}</p>
          <p>Pending: {applications.filter((application) => application.status !== 'completed').length}</p>
        </Card>
      </div>
      <Card title="Applications">
        <Table
          data={applications}
          columns={[
            { key: 'applicantName', header: 'Applicant' },
            { key: 'product', header: 'Product' },
            { key: 'amount', header: 'Amount', render: (application) => `$${application.amount.toLocaleString()}` },
            { key: 'status', header: 'Status' },
            {
              key: 'updatedAt',
              header: 'Updated',
              render: (application) => new Date(application.updatedAt).toLocaleString()
            }
          ]}
          emptyState="No applications found"
        />
      </Card>
    </div>
  );
}
