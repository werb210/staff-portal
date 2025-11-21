import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api/client";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  title?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface ContactsResponse {
  data: Contact[];
  total: number;
  page: number;
  pageSize: number;
  tags?: string[];
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ContactInput = z.infer<typeof contactSchema>;

async function fetchContacts(params: {
  search?: string;
  tag?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<ContactsResponse> {
  const res = await api.get("/api/crm/contacts", { params });
  return res.data as ContactsResponse;
}

async function createContact(payload: ContactInput): Promise<Contact> {
  const res = await api.post("/api/crm/contacts", payload);
  return res.data as Contact;
}

async function updateContact(id: string, payload: Partial<ContactInput>): Promise<Contact> {
  const res = await api.patch(`/api/crm/contacts/${id}`, payload);
  return res.data as Contact;
}

async function fetchActivities(contactId: string): Promise<ActivityItem[]> {
  const res = await api.get(`/api/crm/activities`, { params: { contactId } });
  return res.data as ActivityItem[];
}

function TagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs border ${
        active ? "bg-blue-100 border-blue-400 text-blue-800" : "bg-white border-gray-200 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ["contacts", { search, selectedTag, page }],
    queryFn: () => fetchContacts({ search, tag: selectedTag, page, pageSize: 10 }),
  });

  const activitiesQuery = useQuery({
    queryKey: ["activities", selectedContact?.id],
    queryFn: () => fetchActivities(selectedContact?.id || ""),
    enabled: Boolean(selectedContact?.id),
  });

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ContactInput> }) =>
      updateContact(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const tags = useMemo(() => {
    const apiTags = contactsQuery.data?.tags ?? [];
    const fromContacts = (contactsQuery.data?.data || []).flatMap((c) => c.tags || []);
    return Array.from(new Set([...apiTags, ...fromContacts]));
  }, [contactsQuery.data]);

  const addForm = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", tags: [] },
  });

  const [showAddModal, setShowAddModal] = useState(false);

  function submitNewContact(values: ContactInput) {
    createMutation.mutate(values, {
      onSuccess: (contact) => {
        setShowAddModal(false);
        addForm.reset();
        setSelectedContact(contact);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage CRM contacts with search, tags, and activities.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Contact</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search contacts"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              active={selectedTag === tag}
              onClick={() => {
                setSelectedTag(selectedTag === tag ? null : tag);
                setPage(1);
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border rounded-lg shadow-sm">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold">Results</h2>
            <span className="text-sm text-gray-500">
              {contactsQuery.data?.total ?? 0} total contacts
            </span>
          </div>
          <div className="divide-y">
            {contactsQuery.data?.data?.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedContact?.id === contact.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {(contact.tags || []).map((tag) => (
                      <span
                        key={`${contact.id}-${tag}`}
                        className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {contactsQuery.isLoading && <p className="p-4">Loading contacts…</p>}
            {contactsQuery.data?.data?.length === 0 && !contactsQuery.isLoading && (
              <p className="p-4 text-gray-600">No contacts found.</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <Button
              variant="outline"
              disabled={(contactsQuery.data?.data?.length || 0) < 10}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="col-span-1 bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-2">Activity</h3>
          {activitiesQuery.isLoading && <p className="text-sm text-gray-600">Loading activity…</p>}
          {activitiesQuery.data?.map((item) => (
            <div key={item.id} className="border-b last:border-b-0 py-2">
              <p className="text-sm font-medium text-gray-900">{item.type}</p>
              <p className="text-xs text-gray-600">{item.description}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {!selectedContact && <p className="text-sm text-gray-600">Select a contact to view activity.</p>}
          {selectedContact && activitiesQuery.data?.length === 0 && !activitiesQuery.isLoading && (
            <p className="text-sm text-gray-600">No activity yet.</p>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Contact</h3>
              <button className="text-sm text-gray-500" onClick={() => setShowAddModal(false)}>
                Close
              </button>
            </div>
            <form
              className="space-y-3"
              onSubmit={addForm.handleSubmit(submitNewContact)}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input {...addForm.register("name")} />
                {addForm.formState.errors.name && (
                  <p className="text-xs text-red-600">{addForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" {...addForm.register("email")} />
                {addForm.formState.errors.email && (
                  <p className="text-xs text-red-600">{addForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input {...addForm.register("phone")} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <Input {...addForm.register("company")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input
                  placeholder="finance, repeat"
                  {...addForm.register("tags", {
                    setValueAs: (value) =>
                      typeof value === "string"
                        ? value
                            .split(",")
                            .map((t: string) => t.trim())
                            .filter(Boolean)
                        : value,
                  })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
