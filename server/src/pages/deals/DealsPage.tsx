import { useQuery } from "@tanstack/react-query";
import { DealsAPI } from "@/api/deals";

export default function DealsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: () => DealsAPI.list(),
  });

  if (isLoading) return <div>Loading deals...</div>;

  const deals = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Deals</h1>
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="px-3 py-2 border-b">Name</th>
            <th className="px-3 py-2 border-b">Stage</th>
            <th className="px-3 py-2 border-b">Amount</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((d: any) => (
            <tr key={d.id} className="text-sm">
              <td className="px-3 py-2 border-b">{d.name}</td>
              <td className="px-3 py-2 border-b">{d.stage}</td>
              <td className="px-3 py-2 border-b">${d.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
