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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import { useToast } from "@/components/ui/toast";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface DocRow {
  id: string;
  name: string;
  category: string;
  type: string;
  version: number;
  sha256: string;
  uploadedAt: string;
  status: "accepted" | "rejected" | "missing" | "reuploaded" | "pending";
  size?: string;
  url?: string;
  thumbnailUrl?: string;
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
  const [preview, setPreview] = useState<DocRow | null>(null);

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const docsQuery = useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const res = await api.get<DocsResponse>("/api/documents", { params: filters });
      return res.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/documents/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      addToast({ title: "Document accepted", variant: "success" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/documents/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      addToast({ title: "Document rejected", variant: "destructive" });
    },
  });

  const reuploadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/documents/${id}/reupload`),
    onSuccess: () => addToast({ title: "Reupload requested", variant: "success" }),
  });

  const columns: ColumnDef<DocRow>[] = useMemo(
    () => [
      { accessorKey: "name", header: "File name" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "type", header: "Type" },
      {
        accessorKey: "uploadedAt",
        header: "Uploaded at",
        cell: ({ row }) => new Date(row.original.uploadedAt).toLocaleString(),
      },
      { accessorKey: "version", header: "Version" },
      { accessorKey: "sha256", header: "SHA256" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "accepted" ? "success" : "outline"}>
            {row.original.status}
          </Badge>
        ),
      },
      { accessorKey: "size", header: "Size" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreview(row.original)}>
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={() => acceptMutation.mutate(row.original.id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(row.original.id)}>
              Reject
            </Button>
            <Button size="sm" variant="secondary" onClick={() => reuploadMutation.mutate(row.original.id)}>
              Reupload
            </Button>
            {row.original.url && (
              <a
                href={row.original.url}
                className="text-sm text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            )}
          </div>
        ),
      },
    ],
    [acceptMutation, rejectMutation, reuploadMutation]
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
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="missing">Missing</option>
          <option value="reuploaded">Reuploaded</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={docsQuery.data?.data ?? []}
        filterColumn="name"
        enablePagination={false}
      />

      <Dialog open={Boolean(preview)} onOpenChange={(value) => !value && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && preview.url ? (
            preview.type?.includes("pdf") ? (
              <div className="h-[500px] overflow-auto border rounded">
                <Document file={preview.url}>
                  <Page pageNumber={1} />
                </Document>
              </div>
            ) : preview.type?.startsWith("image") ? (
              <img src={preview.url} alt={preview.name} className="max-h-[500px] w-full object-contain" />
            ) : (
              <div className="space-y-2 text-sm">
                <p>No preview available.</p>
                <p>Checksum: {preview.sha256}</p>
                <p>Version: {preview.version}</p>
              </div>
            )
          ) : (
            <p className="text-sm text-red-600">No preview URL found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
