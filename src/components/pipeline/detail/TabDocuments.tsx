import { useState } from "react";
import { usePipelineDetailStore } from "@/state/pipelineDetailStore";
import { DocumentRecord } from "@/types/Documents";
import api from "@/utils/api";
import clsx from "clsx";

export default function TabDocuments() {
  const { documents, refreshDocuments } = usePipelineDetailStore();

  if (!documents || documents.length === 0) {
    return <div className="text-gray-700">No documents uploaded.</div>;
  }

  return (
    <div className="space-y-6">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} refresh={refreshDocuments} />
      ))}
    </div>
  );
}

function DocumentCard({
  doc,
  refresh,
}: {
  doc: DocumentRecord;
  refresh: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const form = new FormData();
    form.append("file", file);
    form.append("category", doc.category);
    form.append("documentId", doc.id);

    setUploading(true);
    await api.post("/documents/reupload", form);
    setUploading(false);
    await refresh();
  };

  const handleAccept = async () => {
    await api.post(`/documents/${doc.id}/accept`);
    await refresh();
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    await api.post(`/documents/${doc.id}/reject`, { reason });
    await refresh();
  };

  const fileMissing = !doc.s3Key;

  return (
    <div
      className={clsx(
        "p-4 rounded-lg shadow bg-white border",
        fileMissing && "border-red-500 bg-red-50"
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-bold">{doc.name}</h3>
          <p className="text-sm text-gray-600">{doc.category}</p>
        </div>

        {fileMissing && (
          <span className="text-red-700 font-bold">
            File missing — re-upload required
          </span>
        )}
      </div>

      {/* PREVIEW */}
      {!fileMissing && (
        <iframe src={doc.previewUrl} className="w-full h-64 bg-gray-100 rounded" />
      )}

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-4">
        <label className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded">
          {uploading ? "Uploading…" : "Re-upload"}
          <input type="file" className="hidden" onChange={handleReupload} />
        </label>

        {!fileMissing && (
          <a
            href={doc.downloadUrl}
            target="_blank"
            className="px-3 py-1 bg-gray-700 text-white rounded"
            rel="noreferrer"
          >
            Download
          </a>
        )}

        <button onClick={handleAccept} className="px-3 py-1 bg-green-600 text-white rounded">
          Accept
        </button>

        <button onClick={handleReject} className="px-3 py-1 bg-red-600 text-white rounded">
          Reject
        </button>
      </div>

      {/* VERSION HISTORY */}
      {doc.versions && doc.versions.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold mb-2">Version History</h4>
          <div className="space-y-2">
            {doc.versions.map((v) => (
              <div
                key={v.id}
                className="p-2 bg-gray-100 rounded border flex justify-between"
              >
                <div>
                  <div className="font-semibold">Version {v.version}</div>
                  <div className="text-sm text-gray-700">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>

                <a
                  className="px-2 py-1 rounded bg-blue-600 text-white"
                  href={v.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
