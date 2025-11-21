import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import { http } from "@/lib/http";
import CompanyDrawer from "./CompanyDrawer";

interface Company {
  id: string;
  name: string;
  owners?: string;
  type?: string;
  province?: string;
  employees?: number;
  annualRevenue?: number;
  applications?: number;
}

interface CompanyResponse {
  data: Company[];
  total: number;
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);

  const companiesQuery = useQuery({
    queryKey: ["companies", { search }],
    queryFn: async () => {
      const res = await http.get<CompanyResponse>("/api/companies", { params: { search } });
      return res.data;
    },
  });

  const columns: ColumnDef<Company>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Business name" },
      { accessorKey: "owners", header: "Owners" },
      { accessorKey: "type", header: "Type (Corp / LLC / Sole Prop)" },
      { accessorKey: "province", header: "Province" },
      {
        accessorKey: "employees",
        header: "Employees",
        cell: ({ row }) => row.original.employees?.toLocaleString() ?? "-",
      },
      {
        accessorKey: "annualRevenue",
        header: "Annual Revenue",
        cell: ({ row }) => (row.original.annualRevenue ? `$${row.original.annualRevenue.toLocaleString()}` : "-"),
      },
      {
        accessorKey: "applications",
        header: "Applications count",
        cell: ({ row }) => <Badge variant="secondary">{row.original.applications ?? 0}</Badge>,
      },
    ],
    []
  );

  if (companiesQuery.isLoading) return <LoadingState label="Loading companies" />;
  if (companiesQuery.isError)
    return <ErrorState onRetry={() => companiesQuery.refetch()} message="Unable to load companies" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Track companies, their contacts, and linked applications.</p>
        </div>
        <Button>Add company</Button>
      </div>

      <Input
        placeholder="Search companies"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-64"
      />

      <DataTable
        columns={columns}
        data={companiesQuery.data?.data ?? []}
        filterColumn="name"
        enablePagination={false}
        onRowClick={(row) => setSelected(row)}
      />

      {selected && (
        <CompanyDrawer
          companyId={selected.id}
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
