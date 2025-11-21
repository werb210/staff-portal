import BankingSummaryCard from "../../components/banking/BankingSummaryCard";
import TransactionsTable from "../../components/banking/TransactionsTable";
import RunBankingAnalysisButton from "../../components/banking/RunBankingAnalysisButton";
import { useParams } from "react-router-dom";

export default function BankingOverviewPage() {
  const { applicationId } = useParams();

  if (!applicationId) return <div>Invalid application ID.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Banking Analysis</h1>

      <RunBankingAnalysisButton applicationId={applicationId} />

      <BankingSummaryCard applicationId={applicationId} />

      <TransactionsTable applicationId={applicationId} />
    </div>
  );
}
