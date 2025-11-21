import { useState } from "react";
import { useApplications } from "../../hooks/useApplications";
import { buildPagination } from "../../utils/pagination";

export default function ListApplicationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useApplications(
    buildPagination(page, 25)
  );

  if (isLoading) return <div>Loading applications...</div>;
  if (error) return <div>Error loading applications</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Applications</h1>

      <table className="min-w-full border rounded bg-white">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Business Name</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.items.map((a: any) => (
            <tr key={a.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{a.id}</td>
              <td className="p-2">{a.businessName}</td>
              <td className="p-2">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
