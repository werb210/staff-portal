import type { DocumentRecord } from '../../hooks/api/useDocuments';

interface DocumentApprovalModalProps {
  document: DocumentRecord;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function DocumentApprovalModal({ document, onAccept, onReject }: DocumentApprovalModalProps) {
  return (
    <div className="modal">
      <h2>Document: {document.name}</h2>
      <p>Category: {document.category}</p>
      <button onClick={() => onAccept(document.id)}>Accept</button>
      <button onClick={() => onReject(document.id)}>Reject</button>
    </div>
  );
}
