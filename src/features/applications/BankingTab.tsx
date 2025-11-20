import { useQuery } from "@tanstack/react-query";
import { getBankingAnalysis } from "./ApplicationService";

export default function BankingTab({ appId }: { appId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["banking", appId],
    queryFn: () => getBankingAnalysis(appId),
  });

  if (isLoading) return <p>Loading banking analysis…</p>;

  return (
    <pre className="bg-gray-900 text-blue-300 text-sm p-3 rounded overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
