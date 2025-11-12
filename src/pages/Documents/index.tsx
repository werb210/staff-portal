import { useState } from 'react';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Table } from '../../components/common/Table';
import { useDocuments, type DocumentItem } from '../../hooks/useDocuments';

const DocumentsPage = () => {
  const { listQuery, approveMutation, rejectMutation, uploadMutation } = useDocuments();
  const [selected, setSelected] = useState<DocumentItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async (document: DocumentItem) => {
    await approveMutation.mutateAsync(document.id);
  };

  const handleReject = (document: DocumentItem) => {
    setSelected(document);
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    if (selected) {
      await rejectMutation.mutateAsync({ id: selected.id, reason: rejectReason });
    }
    setRejectReason('');
    setShowRejectModal(false);
  };

  const handleUpload = async (document: DocumentItem, file: File) => {
    await uploadMutation.mutateAsync({ id: document.id, file });
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h2>Documents</h2>
          <p>Review and manage borrower documentation.</p>
        </div>
      </header>
      {listQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="card">
          <Table
            data={listQuery.data ?? []}
            keySelector={(document) => document.id}
            emptyMessage="No documents pending review."
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', accessor: 'type' },
              { header: 'Status', accessor: 'status' },
              { header: 'Uploaded By', accessor: 'uploadedBy' },
              { header: 'Uploaded At', accessor: 'uploadedAt' },
              {
                header: 'Actions',
                accessor: (document) => (
                  <div className="table-actions">
                    <Button
                      variant="ghost"
                      onClick={() => document.downloadUrl && window.open(document.downloadUrl, '_blank')}
                    >
                      Preview
                    </Button>
                    <Button variant="ghost" onClick={() => handleApprove(document)} disabled={approveMutation.isPending}>
                      Accept
                    </Button>
                    <Button variant="ghost" onClick={() => handleReject(document)} disabled={rejectMutation.isPending}>
                      Reject
                    </Button>
                    <FileUpload onSelect={(file) => handleUpload(document, file)} />
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
      <Modal
        open={showRejectModal}
        title={`Reject ${selected?.name ?? ''}`}
        onClose={() => setShowRejectModal(false)}
        footer={
          <Button onClick={submitReject} disabled={rejectMutation.isPending}>
            Submit
          </Button>
        }
      >
        <label>
          Reason
          <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
        </label>
      </Modal>
    </section>
  );
};

export default DocumentsPage;
