import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDocumentPresign, fetchDocumentRequirements, updateDocumentStatus, type DocumentPresignResponse } from "@/api/documents";
import { retryUnlessClientError } from "@/api/retryPolicy";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import type { DocumentRequirement } from "@/types/documents.types";
import DocumentListItem from "./DocumentListItem";
import DocumentVersionHistory from "./DocumentVersionHistory";
import { getErrorMessage } from "@/utils/errors";

const DocumentsTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading, error } = useQuery<DocumentRequirement[]>({
    queryKey: ["applications", applicationId, "documents"],
    queryFn: ({ signal }) => fetchDocumentRequirements(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId),
    retry: retryUnlessClientError
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const selectedDocument = useMemo(() => documents.find((doc) => doc.id === selectedId) ?? documents[0], [documents, selectedId]);
  const { data: presignData } = useQuery<DocumentPresignResponse>({
    queryKey: ["documents", selectedDocument?.id, "presign"],
    queryFn: ({ signal }) => fetchDocumentPresign(selectedDocument?.id ?? "", { signal }),
    enabled: Boolean(selectedDocument?.id)
  });

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view documents.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading documents…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load documents.")}</div>;

  const handleApprove = async () => {
    if (!selectedDocument) return;
    await updateDocumentStatus(selectedDocument.id, "approved");
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId, "documents"] });
  };

  const handleReject = async () => {
    if (!selectedDocument) return;
    await updateDocumentStatus(selectedDocument.id, "rejected", rejectionReason.trim() || undefined);
    setRejectionReason("");
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId, "documents"] });
  };

  const canApprove = selectedDocument?.status === "uploaded";
  const canReject = selectedDocument?.status === "uploaded" || selectedDocument?.status === "approved";

  return (
    <div className="drawer-tab drawer-tab__documents">
      <div className="documents-layout">
        <div className="documents-list">
          {documents.length ? (
            documents.map((doc) => (
              <DocumentListItem key={doc.id} document={doc} isSelected={selectedDocument?.id === doc.id} onSelect={() => setSelectedId(doc.id)} />
            ))
          ) : (
            <div className="drawer-placeholder">No documents uploaded.</div>
          )}
        </div>
        <div className="documents-viewer">
          {selectedDocument ? (
            <div className="documents-viewer__content">
              <div className="documents-viewer__header">
                <div>
                  <div className="documents-viewer__title">{selectedDocument.name}</div>
                  <div className="documents-viewer__meta">
                    Status: {selectedDocument.status}
                    {selectedDocument.version ? ` · Version ${selectedDocument.version}` : ""}
                    {selectedDocument.requiredBy ? ` · Required by ${selectedDocument.requiredBy}` : ""}
                  </div>
                </div>
                <div className="documents-viewer__actions">
                  <a className="btn btn--ghost" href={presignData?.url} target="_blank" rel="noreferrer">
                    Download
                  </a>
                  <button type="button" className="btn btn--primary" onClick={handleApprove} disabled={!canApprove}>
                    Approve
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={handleReject} disabled={!canReject}>
                    Reject
                  </button>
                </div>
              </div>
              <div className="documents-viewer__notes">
                <label className="documents-viewer__label" htmlFor="document-rejection-reason">
                  Rejection reason (shared with client)
                </label>
                <textarea
                  id="document-rejection-reason"
                  className="documents-viewer__textarea"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Explain what needs to be corrected."
                />
                {selectedDocument.rejectionReason ? (
                  <div className="documents-viewer__reason">Previous rejection: {selectedDocument.rejectionReason}</div>
                ) : null}
              </div>
              <div className="documents-viewer__preview">
                {presignData?.url ? (
                  <iframe title="Document preview" src={presignData.url} className="documents-viewer__frame" />
                ) : (
                  <div className="drawer-placeholder">No preview available.</div>
                )}
              </div>
              <DocumentVersionHistory documentId={selectedDocument.id} />
            </div>
          ) : (
            <div className="drawer-placeholder">Select a document to preview.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
