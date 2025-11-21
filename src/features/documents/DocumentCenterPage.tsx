import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import api from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";

interface DocRow {
  id: string;
  name: string;
  category: string;
  application: string;
  uploadedAt: string;
  status: "Accepted" | "Rejected" | "Missing" | "Reuploaded";
  size?: string;
}

interface DocsResponse {
  data: DocRow[];
  total: number;
}

export default function DocumentCenterPage() {
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    applicationId: "",
    business: "",
  });

  const queryClient = useQueryClient();

  const docsQuery = useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const res = await api.get<DocsResponse>("/api/documents", { params: filters });
      return res.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/documents/${id}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/documents/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const columns: ColumnDef<DocRow>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Document name" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "application", header: "Application" },
      {
        accessorKey: "uploadedAt",
        header: "Uploaded date",
        cell: ({ row }) => new Date(row.original.uploadedAt).toLocaleString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      },
      { accessorKey: "size", header: "File size" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => acceptMutation.mutate(row.original.id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(row.original.id)}>
              Reject
            </Button>
            <Button size="sm" variant="secondary" onClick={() => api.post(`/api/documents/${row.original.id}/reupload`)}>
              Reupload
            </Button>
          </div>
        ),
      },
    ],
    [acceptMutation, rejectMutation]
  );

  if (docsQuery.isLoading) return <LoadingState label="Loading documents" />;
  if (docsQuery.isError) return <ErrorState onRetry={() => docsQuery.refetch()} message="Unable to load documents" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Center</h1>
        <p className="text-gray-600">Search and triage documents across all applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Business name"
          value={filters.business}
          onChange={(e) => setFilters((prev) => ({ ...prev, business: e.target.value }))}
        />
        <Input
          placeholder="Application ID"
          value={filters.applicationId}
          onChange={(e) => setFilters((prev) => ({ ...prev, applicationId: e.target.value }))}
        />
        <Input
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Missing">Missing</option>
          <option value="Reuploaded">Reuploaded</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={docsQuery.data?.data ?? []}
        filterColumn="name"
        enablePagination={false}
      />
    </div>
  );
}
