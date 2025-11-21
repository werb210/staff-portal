import { useApplications } from "./useApplications";
import { Link } from "react-router-dom";

export default function ApplicationsListPage() {
  const { data, isLoading, error } = useApplications();

  if (isLoading) return <div>Loading applications…</div>;
  if (error) return <div className="text-red-600">Failed to load.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>

      <div className="bg-white shadow border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Business</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((app) => (
              <tr key={app.id} className="border-b">
                <td classname="px-4 py-2">{app.businessName}</td>
                <td className="px-4 py-2">{app.contactName}</td>
                <td className="px-4 py-2">{app.status}</td>
                <td className="px-4 py-2">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/applications/${app.id}`}
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
    </div>
  );
}
