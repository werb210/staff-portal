import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptDocument,
  getApplicationDocuments,
  rejectDocument,
} from "./ApplicationService";
import { ApplicationDocument } from "./ApplicationTypes";

const DOCS_QUERY_KEY = "docs";

type RejectPayload = { docId: string; category: string };

type DocumentsTabProps = {
  appId: string;
};

export default function DocumentsTab({ appId }: DocumentsTabProps) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ApplicationDocument[]>({
    queryKey: [DOCS_QUERY_KEY, appId],
    queryFn: () => getApplicationDocuments(appId),
    enabled: Boolean(appId),
  });

  const acceptMutation = useMutation({
    mutationFn: acceptDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCS_QUERY_KEY, appId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ docId, category }: RejectPayload) =>
      rejectDocument(docId, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCS_QUERY_KEY, appId] });
    },
  });

  if (isLoading) return <p>Loading documents…</p>;

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return <p className="text-red-600">Failed to load documents: {message}</p>;
  }

  if (!data?.length) {
    return <p className="text-gray-700">No documents available for this application.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((doc) => (
        <div
          key={doc.id}
          className="border rounded p-4 bg-white shadow flex justify-between items-start gap-4"
        >
          <div>
            <p className="font-semibold text-gray-900">{doc.name}</p>
            <p className="text-sm text-gray-600">Category: {doc.category}</p>
            {doc.status && (
              <p className="text-xs text-gray-500 mt-1">Status: {doc.status}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <a
              href={doc.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Download
            </a>

            <button
              className="text-green-600 disabled:text-green-300"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate(doc.id)}
            >
              {acceptMutation.isPending ? "Accepting…" : "Accept"}
            </button>

            <button
              className="text-red-600 disabled:text-red-300"
              disabled={rejectMutation.isPending}
              onClick={() =>
                rejectMutation.mutate({ docId: doc.id, category: doc.category })
              }
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
