import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLenderMatches, resendToLender } from "./ApplicationService";
import { LenderMatch } from "./ApplicationTypes";

type LendersTabProps = {
  appId: string;
};

export default function LendersTab({ appId }: LendersTabProps) {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<LenderMatch[]>({
    queryKey: ["lenders", appId],
    queryFn: () => getLenderMatches(appId),
    enabled: Boolean(appId),
  });

  const sendMutation = useMutation({
    mutationFn: ({ lenderId }: { lenderId: string }) =>
      resendToLender(appId, lenderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lenders", appId] });
    },
  });

  if (isLoading) return <p>Loading lender matches…</p>;

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return <p className="text-red-600">Failed to load lenders: {message}</p>;
  }

  if (!data?.length) {
    return <p className="text-gray-700">No lender matches available.</p>;
  }

  const sendErrorMessage = sendMutation.isError
    ? sendMutation.error instanceof Error
      ? sendMutation.error.message
      : "Unknown error"
    : null;

  return (
    <div className="space-y-4">
      {data.map((lender) => (
        <div
          key={lender.id}
          className="border rounded p-4 bg-white shadow flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-gray-900">{lender.name}</p>
            <p className="text-sm text-gray-600">Score: {lender.matchScore}%</p>
            {sendErrorMessage && (
              <p className="text-xs text-red-600 mt-1">{sendErrorMessage}</p>
            )}
          </div>

          <button
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
            disabled={sendMutation.isPending}
            onClick={() => sendMutation.mutate({ lenderId: lender.id })}
          >
            {sendMutation.isPending ? "Sending…" : "Send to Lender"}
          </button>
        </div>
      ))}
    </div>
  );
}
