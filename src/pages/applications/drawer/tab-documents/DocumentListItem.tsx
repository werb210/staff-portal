import type { ApplicationDocumentsResponse } from "@/api/applications";

const statusClass = (status: string) => `doc-status doc-status--${status?.toLowerCase()}`;

const DocumentListItem = ({
  document,
  isSelected,
  onSelect
}: {
  document: ApplicationDocumentsResponse[number];
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button type="button" className={`document-list-item ${isSelected ? "selected" : ""}`} onClick={onSelect}>
    <div className="document-list-item__name">{document.name}</div>
    <div className={statusClass(document.status)}>{document.status}</div>
    {document.uploadedAt ? <div className="document-list-item__meta">Uploaded {document.uploadedAt}</div> : null}
  </button>
);

export default DocumentListItem;
