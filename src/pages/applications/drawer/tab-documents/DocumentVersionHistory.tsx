import { useQuery } from "@tanstack/react-query";
import { fetchDocumentVersions, restoreDocumentVersion } from "@/api/documents";

const DocumentVersionHistory = ({ documentId }: { documentId: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["documents", documentId, "versions"],
    queryFn: () => fetchDocumentVersions(documentId),
    enabled: Boolean(documentId)
  });

  if (isLoading) return <div className="drawer-placeholder">Loading version history…</div>;
  if (isError) return <div className="drawer-placeholder">Unable to load versions.</div>;

  return (
    <div className="document-version-history">
      {data?.data?.length ? (
        data.data.map((version) => (
          <div key={version.id} className="document-version">
            <div>
              <div className="document-version__title">Version {version.version}</div>
              <div className="document-version__meta">Uploaded {version.uploadedAt}</div>
            </div>
            <button type="button" className="btn btn--ghost" onClick={() => restoreDocumentVersion(documentId, version.version)}>
              Restore
            </button>
          </div>
        ))
      ) : (
        <div className="drawer-placeholder">No version history.</div>
      )}
    </div>
  );
};

export default DocumentVersionHistory;
