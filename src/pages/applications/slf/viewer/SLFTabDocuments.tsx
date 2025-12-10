import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

const SLFTabDocuments = ({ applicationId }: { applicationId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["slf", "documents", applicationId],
    queryFn: () => apiClient.get(`/api/slf/applications/${applicationId}/documents`)
  });

  const { data: docs } = data ?? { data: [] } as { data: Array<any> };

  const handleView = async (docId: string) => {
    const presign = await apiClient.get(`/api/slf/documents/${docId}/presign`);
    const url = presign.data?.url;
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (isLoading) return <div>Loading documents...</div>;

  return (
    <div className="slf-documents">
      {!docs?.length && <div>No documents uploaded.</div>}
      <ul>
        {docs?.map((doc) => (
          <li key={doc.id} className="document-row">
            <div>
              <div className="document-title">{doc.type}</div>
              <div className="document-meta">{doc.filename}</div>
              <div className="document-meta">Uploaded {new Date(doc.uploadedAt).toLocaleString()}</div>
            </div>
            <div className="document-actions">
              <button className="btn" onClick={() => handleView(doc.id)}>
                View
              </button>
              <a className="btn btn-secondary" href={doc.downloadUrl ?? doc.url} download>
                Download
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SLFTabDocuments;
