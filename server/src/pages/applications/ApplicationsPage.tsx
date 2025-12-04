import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApplicationsAPI } from "@/api/applications";

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => ApplicationsAPI.list(),
  });

  if (isLoading) return <div>Loading applications...</div>;

  const apps = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="px-3 py-2 border-b">ID</th>
            <th className="px-3 py-2 border-b">Business</th>
            <th className="px-3 py-2 border-b">Status</th>
            <th className="px-3 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a: any) => (
            <tr key={a.id} className="text-sm">
              <td className="px-3 py-2 border-b">{a.id}</td>
              <td className="px-3 py-2 border-b">{a.businessName}</td>
              <td className="px-3 py-2 border-b">{a.status}</td>
              <td className="px-3 py-2 border-b">
                <Link
                  to={`/applications/${a.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
