import { useQuery } from "@tanstack/react-query";
import { getBankingAnalysis } from "./ApplicationService";
import { BankingAnalysis } from "./ApplicationTypes";

type BankingTabProps = {
  appId: string;
};

export default function BankingTab({ appId }: BankingTabProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<BankingAnalysis>({
    queryKey: ["banking", appId],
    queryFn: () => getBankingAnalysis(appId),
    enabled: Boolean(appId),
  });

  if (isLoading) return <p>Loading banking analysis…</p>;

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return <p className="text-red-600">Failed to load banking analysis: {message}</p>;
  }

  return (
    <pre className="bg-gray-900 text-blue-300 text-sm p-3 rounded overflow-auto max-h-[540px]">
      {JSON.stringify(data ?? {}, null, 2)}
    </pre>
  );
}
