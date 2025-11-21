import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Building2, Merge, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import ContactDrawer from "./ContactDrawer";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  lastActivity?: string;
  createdAt?: string;
  pipelineCount?: number;
  status: "Lead" | "Active" | "Inactive";
}

interface ContactResponse {
  data: Contact[];
  total: number;
  page: number;
  pageSize: number;
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["Lead", "Active", "Inactive"]),
});

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ["contacts", { page, pageSize, search, status }],
    queryFn: async () => {
      const res = await api.get<ContactResponse>("/api/contacts", {
        params: { page, pageSize, search, status: status || undefined },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/contacts/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  });

  const mergeMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post("/api/contacts/merge", { ids });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ contactId, companyId }: { contactId: string; companyId: string }) => {
      await api.post(`/api/contacts/${contactId}/assign`, { companyId });
    },
  });

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", status: "Lead" },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: z.infer<typeof contactSchema>) => {
      if (mode === "create") {
        const res = await api.post<Contact>("/api/contacts", values);
        return res.data;
      }
      if (!selected) throw new Error("No contact selected");
      const res = await api.patch<Contact>(`/api/contacts/${selected.id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setShowForm(false);
    },
  });

  const columns: ColumnDef<Contact>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "company", header: "Company" },
      {
        accessorKey: "pipelineCount",
        header: "Pipeline Applications",
        cell: ({ row }) => row.original.pipelineCount ?? 0,
      },
      {
        accessorKey: "createdAt",
        header: "Created at",
        cell: ({ row }) =>
          row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—",
      },
      {
        accessorKey: "lastActivity",
        header: "Last contacted",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {row.original.lastActivity
              ? new Date(row.original.lastActivity).toLocaleString()
              : "No activity"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      },
    ],
    []
  );

  if (contactsQuery.isLoading) {
    return <LoadingState label="Loading contacts" />;
  }

  if (contactsQuery.isError) {
    return (
      <ErrorState
        onRetry={() => contactsQuery.refetch()}
        message="Failed to load contacts"
      />
    );
  }

  const data = contactsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage CRM contacts with search, filters, and quick actions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setMode("create"); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add contact
          </Button>
          {selected && (
            <>
              <Button variant="secondary" onClick={() => { setMode("edit"); form.reset({ ...selected }); setShowForm(true); }}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="outline" onClick={() => mergeMutation.mutate([selected.id])}>
                <Merge className="w-4 h-4 mr-2" /> Merge
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selected.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => assignMutation.mutate({ contactId: selected.id, companyId: "auto" })}
              >
                <Building2 className="w-4 h-4 mr-2" /> Assign company
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-64"
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <DataTable
          columns={columns}
          data={data}
          filterColumn="name"
          enablePagination={false}
          onRowClick={(row) => setSelected(row)}
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-600">Page {page}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={(page * pageSize) >= (contactsQuery.data?.total ?? 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="text-sm text-slate-600">
          Activity feeds and notes appear in the drawer timeline.
        </TabsContent>
      </Tabs>

      {selected && (
        <ContactDrawer
          contactId={selected.id}
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add contact" : "Edit contact"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Contact name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input placeholder="email@example.com" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="(555) 123-4567" {...form.register("phone")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Company</label>
              <Input placeholder="Company name" {...form.register("company")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={form.watch("status")}
                onChange={(e) => form.setValue("status", e.target.value as any)}
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saveMutation.isPending}>
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
