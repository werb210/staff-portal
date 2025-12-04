import { useQuery } from "@tanstack/react-query";
import { CompaniesAPI } from "@/api/companies";

export default function CompaniesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => CompaniesAPI.list(),
  });

  if (isLoading) return <div>Loading companies...</div>;

  const companies = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Companies</h1>
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="px-3 py-2 border-b">Name</th>
            <th className="px-3 py-2 border-b">Industry</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c: any) => (
            <tr key={c.id} className="text-sm">
              <td className="px-3 py-2 border-b">{c.name}</td>
              <td className="px-3 py-2 border-b">{c.industry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
