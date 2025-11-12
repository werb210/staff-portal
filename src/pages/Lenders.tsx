import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Table } from '../components/Table';
import { useAppContext } from '../contexts/AppContext';
import { useLenders, useLenderProducts, useSendToLender } from '../hooks/useLenders';

export default function Lenders() {
  const { applications } = useAppContext();
  const lendersQuery = useLenders();
  const [selectedLenderId, setSelectedLenderId] = useState<string | undefined>(undefined);
  const productsQuery = useLenderProducts(selectedLenderId);
  const sendToLender = useSendToLender();
  const [selectedApplicationId, setSelectedApplicationId] = useState('');

  return (
    <div className="page">
      <div className="grid grid--2">
        <Card title="Lenders" className="lenders">
          <Table
            data={lendersQuery.data}
            isLoading={lendersQuery.isLoading}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'status', header: 'Status' },
              { key: 'contactEmail', header: 'Email' }
            ]}
            emptyState="No lenders found"
          />
          <div className="lenders__selector">
            <label>
              Select lender
              <select value={selectedLenderId ?? ''} onChange={(event) => setSelectedLenderId(event.target.value)}>
                <option value="">Select…</option>
                {lendersQuery.data?.map((lender) => (
                  <option key={lender.id} value={lender.id}>
                    {lender.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Application
              <select
                value={selectedApplicationId}
                onChange={(event) => setSelectedApplicationId(event.target.value)}
              >
                <option value="">Select…</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.applicantName}
                  </option>
                ))}
              </select>
            </label>
            <Button
              onClick={() =>
                selectedApplicationId && selectedLenderId
                  ? sendToLender.mutate({ applicationId: selectedApplicationId, lenderId: selectedLenderId })
                  : undefined
              }
              disabled={!selectedLenderId || !selectedApplicationId || sendToLender.isPending}
            >
              {sendToLender.isPending ? 'Sending…' : 'Send to lender'}
            </Button>
          </div>
        </Card>
        <Card title="Products">
          <Table
            data={productsQuery.data}
            isLoading={productsQuery.isLoading}
            columns={[
              { key: 'name', header: 'Product' },
              {
                key: 'rate',
                header: 'Rate',
                render: (product) => `${product.rate}%`
              },
              {
                key: 'maxAmount',
                header: 'Max Amount',
                render: (product) => `$${product.maxAmount.toLocaleString()}`
              },
              {
                key: 'minCreditScore',
                header: 'Min Credit Score'
              }
            ]}
            emptyState={selectedLenderId ? 'No products found' : 'Select a lender to see products'}
          />
        </Card>
      </div>
    </div>
  );
}
