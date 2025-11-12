import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Table } from '../components/Table';
import { useDocuments, useAcceptDocument, useRejectDocument } from '../hooks/useDocuments';

export default function Documents() {
  const documentsQuery = useDocuments();
  const acceptDocument = useAcceptDocument();
  const rejectDocument = useRejectDocument();
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="page">
      <Card title="Documents queue">
        <Table
          data={documentsQuery.data}
          isLoading={documentsQuery.isLoading}
          columns={[
            { key: 'name', header: 'Document' },
            { key: 'applicationId', header: 'Application' },
            { key: 'status', header: 'Status' },
            {
              key: 'uploadedAt',
              header: 'Uploaded',
              render: (document) => new Date(document.uploadedAt).toLocaleString()
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (document) => (
                <div className="table__actions">
                  <Button
                    variant="secondary"
                    onClick={() => acceptDocument.mutate(document.id)}
                    disabled={acceptDocument.isPending}
                  >
                    Accept
                  </Button>
                  <input
                    placeholder="Reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    className="table__input"
                  />
                  <Button
                    variant="danger"
                    onClick={() =>
                      rejectDocument.mutate({ documentId: document.id, reason: rejectionReason })
                    }
                    disabled={rejectDocument.isPending}
                  >
                    Reject
                  </Button>
                </div>
              )
            }
          ]}
          emptyState="All caught up!"
        />
      </Card>
    </div>
  );
}
