import { useState } from "react";
import { useApplicationsPaged } from "./useApplicationsPaged";
import { DataTable } from "@/components/data-table/DataTable";
import { applicationColumns } from "@/components/data-table/columns";
import { Input } from "@/components/ui/input";

export default function ApplicationsListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const { data, isLoading, error } = useApplicationsPaged(
    page,
    pageSize,
    search,
    sortBy,
    sortDirection
  );

  if (isLoading) return <div>Loading applications…</div>;
  if (error) return <div className="text-red-600">Failed to load applications.</div>;

  const { items, totalPages } = data ?? { items: [], totalPages: 1 };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Applications</h1>

      <Input
        placeholder="Search business or contact…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      <DataTable
        columns={applicationColumns}
        data={items}
        filterColumn="businessName"
        enablePagination={false}
      />

      <div className="flex justify-end items-center gap-2">
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="px-2">
          Page {page} / {totalPages}
        </span>

        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
