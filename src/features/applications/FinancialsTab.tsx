import { useQuery } from "@tanstack/react-query";
import { getFinancials } from "./ApplicationService";
import { Financials } from "./ApplicationTypes";

type FinancialsTabProps = {
  appId: string;
};

export default function FinancialsTab({ appId }: FinancialsTabProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<Financials>({
    queryKey: ["financials", appId],
    queryFn: () => getFinancials(appId),
    enabled: Boolean(appId),
  });

  if (isLoading) return <p>Loading financials…</p>;

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return <p className="text-red-600">Failed to load financials: {message}</p>;
  }

  return (
    <pre className="bg-gray-900 text-purple-300 text-sm p-3 rounded overflow-auto max-h-[540px]">
      {JSON.stringify(data ?? {}, null, 2)}
    </pre>
  );
}
