import { useQuery, useMutation } from "@tanstack/react-query";
import { getLenderMatches, resendToLender } from "./ApplicationService";

export default function LendersTab({ appId }: { appId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["lenders", appId],
    queryFn: () => getLenderMatches(appId),
  });

  const sendMutation = useMutation({
    mutationFn: ({ lenderId }: { lenderId: string }) =>
      resendToLender(appId, lenderId),
  });

  if (isLoading) return <p>Loading lender matches…</p>;

  return (
    <div className="space-y-4">
      {data.map((lender: any) => (
        <div
          key={lender.id}
          className="border rounded p-4 bg-white shadow flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{lender.name}</p>
            <p className="text-sm text-gray-600">
              Score: {lender.matchScore}%
            </p>
          </div>

          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => sendMutation.mutate({ lenderId: lender.id })}
          >
            Send to Lender
          </button>
        </div>
      ))}
    </div>
  );
}
