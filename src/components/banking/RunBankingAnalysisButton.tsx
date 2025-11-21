import { useRunBankingAnalysis } from "../../hooks/useBanking";

export default function RunBankingAnalysisButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const job = useRunBankingAnalysis(applicationId);

  return (
    <button
      onClick={() => job.mutate()}
      className="px-4 py-2 bg-blue-600 text-white rounded"
      disabled={job.isLoading}
    >
      {job.isLoading ? "Analyzing…" : "Run Banking Analysis"}
    </button>
  );
}
