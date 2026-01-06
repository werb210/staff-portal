import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApplicationDocuments, type ApplicationDocumentsResponse } from "@/api/applications";
import { acceptDocument, fetchDocumentPresign, rejectDocument, type DocumentPresignResponse } from "@/api/documents";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import DocumentListItem from "./DocumentListItem";
import DocumentVersionHistory from "./DocumentVersionHistory";
import { getErrorMessage } from "@/utils/errors";

const DocumentsTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading, error } = useQuery<ApplicationDocumentsResponse>({
    queryKey: ["applications", applicationId, "documents"],
    queryFn: ({ signal }) => fetchApplicationDocuments(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedDocument = useMemo(() => documents.find((doc) => doc.id === selectedId) ?? documents[0], [documents, selectedId]);
  const { data: presignData } = useQuery<DocumentPresignResponse>({
    queryKey: ["documents", selectedDocument?.id, "presign"],
    queryFn: ({ signal }) => fetchDocumentPresign(selectedDocument?.id ?? "", { signal }),
    enabled: Boolean(selectedDocument?.id)
  });

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view documents.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading documents…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load documents.")}</div>;

  const handleAccept = async () => {
    if (!selectedDocument) return;
    await acceptDocument(selectedDocument.id);
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId, "documents"] });
  };

  const handleReject = async () => {
    if (!selectedDocument) return;
    await rejectDocument(selectedDocument.id, "Rejected by staff");
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId, "documents"] });
  };

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
                  <div className="documents-viewer__meta">Version {selectedDocument.version ?? 1}</div>
                </div>
                <div className="documents-viewer__actions">
                  <a className="btn btn--ghost" href={presignData?.url} target="_blank" rel="noreferrer">
                    Download
                  </a>
                  <button type="button" className="btn btn--primary" onClick={handleAccept}>
                    Accept
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={handleReject}>
                    Reject
                  </button>
                </div>
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
