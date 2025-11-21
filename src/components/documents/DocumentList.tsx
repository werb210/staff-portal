import { useDocuments } from "../../hooks/useDocuments";
import { useRunOcr } from "../../hooks/useOcr";
import { getDocumentPreviewUrl } from "../../api/documents";

export default function DocumentList({ applicationId }: { applicationId: string }) {
  const { data, isLoading } = useDocuments(applicationId);

  if (isLoading) return <div>Loading documents…</div>;
  if (!data || !data.items?.length) return <div>No documents uploaded yet.</div>;

  return (
    <div className="mt-6 space-y-4">
      {data.items.map((doc: any) => (
        <DocumentItem key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

function DocumentItem({ doc }: { doc: any }) {
  const runOcr = useRunOcr(doc.id);
  const previewUrl = getDocumentPreviewUrl(doc.id);

  return (
    <div className="border rounded p-4 bg-gray-50 flex items-center justify-between">
      <div>
        <div className="font-semibold">{doc.category}</div>
        <div className="text-sm text-gray-600">{doc.originalName}</div>
      </div>

      <div className="flex gap-3">
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-gray-200 rounded"
        >
          Preview
        </a>

        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded"
          onClick={() => runOcr.mutate()}
        >
          Run OCR
        </button>
      </div>
    </div>
  );
}
