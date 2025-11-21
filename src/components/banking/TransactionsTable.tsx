import { useBankingTransactions } from "../../hooks/useBanking";

export default function TransactionsTable({ applicationId }: { applicationId: string }) {
  const { data, isLoading } = useBankingTransactions(applicationId);

  if (isLoading) return <div>Loading transactions…</div>;
  if (!data || !data.items?.length) return <div>No transactions available.</div>;

  return (
    <div className="mt-6 p-4 bg-white border rounded shadow-sm overflow-auto">
      <h2 className="text-lg font-semibold mb-3">Transactions</h2>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left border-b">
            <th className="p-2">Date</th>
            <th className="p-2">Description</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Type</th>
          </tr>
        </thead>

        <tbody>
          {data.items.map((tx: any) => (
            <tr key={tx.id} className="border-b">
              <td className="p-2">{tx.date}</td>
              <td className="p-2">{tx.description}</td>
              <td className="p-2">${tx.amount.toLocaleString()}</td>
              <td className="p-2 capitalize">{tx.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
