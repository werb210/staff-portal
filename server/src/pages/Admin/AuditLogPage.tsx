import { useQuery } from "@tanstack/react-query";
import { ReportsAPI } from "@/core/endpoints/reports.api";

export default function AuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-log"],
    queryFn: () => ReportsAPI.auditLog(),
  });

  if (isLoading) return <div>Loading audit log...</div>;

  const entries = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Audit Log</h1>
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="px-3 py-2 border-b">When</th>
            <th className="px-3 py-2 border-b">User</th>
            <th className="px-3 py-2 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e: any) => (
            <tr key={e.id} className="text-sm">
              <td className="px-3 py-2 border-b">
                {new Date(e.createdAt).toLocaleString()}
              </td>
              <td className="px-3 py-2 border-b">{e.userEmail}</td>
              <td className="px-3 py-2 border-b">{e.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
