import { useState } from "react";
import { useApplications } from "@/features/applications/hooks/useApplications";
import { Link } from "react-router-dom";

export default function ApplicationsPage() {
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading, error } = useApplications(page, limit);

  if (isLoading) return <p className="p-4">Loading applications…</p>;
  if (error) return <p className="p-4 text-red-600">Failed to load.</p>;

  const apps = data?.applications ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>

      <table className="min-w-full bg-white shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Business Name</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left"></th>
          </tr>
        </thead>

        <tbody>
          {apps.map((app) => (
            <tr key={app.id} className="border-b">
              <td className="p-3">{app.id}</td>
              <td className="p-3">{app.businessName}</td>
              <td className="p-3">{app.status}</td>
              <td className="p-3">{new Date(app.createdAt).toLocaleDateString()}</td>
              <td className="p-3">
                <Link
                  className="text-blue-600 underline"
                  to={`/applications/${app.id}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200"
        >
          Previous
        </button>

        <button
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}
