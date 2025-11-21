import { useApplications } from "./useApplications";
import { DataTable } from "@/components/data-table/DataTable";
import { applicationColumns } from "@/components/data-table/columns";

export default function ApplicationsListPage() {
  const { data, isLoading, error } = useApplications();

  if (isLoading) return <div>Loading applications…</div>;
  if (error) return <div className="text-red-600">Failed to load applications.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>

      <DataTable
        columns={applicationColumns}
        data={data || []}
        filterColumn="businessName"
      />
    </div>
  );
}
