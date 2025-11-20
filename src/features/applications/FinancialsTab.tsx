import { useQuery } from "@tanstack/react-query";
import { getFinancials } from "./ApplicationService";

export default function FinancialsTab({ appId }: { appId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["financials", appId],
    queryFn: () => getFinancials(appId),
  });

  if (isLoading) return <p>Loading financials…</p>;

  return (
    <pre className="bg-gray-900 text-purple-300 text-sm p-3 rounded overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
