import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getApplicationDocuments,
  acceptDocument,
  rejectDocument,
} from "./ApplicationService";

export default function DocumentsTab({ appId }: { appId: string }) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["docs", appId],
    queryFn: () => getApplicationDocuments(appId),
  });

  if (isLoading) return <p>Loading documents…</p>;

  return (
    <div className="space-y-4">
      {data.map((doc: any) => (
        <div
          key={doc.id}
          className="border rounded p-4 bg-white shadow flex justify-between"
        >
          <div>
            <p className="font-semibold">{doc.name}</p>
            <p className="text-sm text-gray-600">Type: {doc.category}</p>
          </div>

          <div className="flex gap-3">
            <a
              href={doc.downloadUrl}
              target="_blank"
              className="text-blue-600 underline"
            >
              Download
            </a>

            <button
              className="text-green-600"
              onClick={async () => {
                await acceptDocument(doc.id);
                qc.invalidateQueries({ queryKey: ["docs", appId] });
              }}
            >
              Accept
            </button>

            <button
              className="text-red-600"
              onClick={async () => {
                await rejectDocument(doc.id, doc.category);
                qc.invalidateQueries({ queryKey: ["docs", appId] });
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
