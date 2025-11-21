import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import api from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";

interface Props {
  contactId: string;
  open: boolean;
  onClose: () => void;
}

interface ContactDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  notes?: string;
  tasks?: { id: string; title: string; status: string }[];
  timeline?: { id: string; message: string; createdAt: string }[];
}

export default function ContactDrawer({ contactId, open, onClose }: Props) {
  const detailQuery = useQuery({
    queryKey: ["contact", contactId],
    queryFn: async () => {
      const res = await api.get<ContactDetail>(`/api/contacts/${contactId}`);
      return res.data;
    },
    enabled: open,
  });

  const tabs = useMemo(
    () => [
      { key: "overview", label: "Overview" },
      { key: "notes", label: "Notes" },
      { key: "tasks", label: "Tasks" },
      { key: "timeline", label: "Timeline" },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Contact {contactId}</span>
            {detailQuery.data?.status && <Badge variant="secondary">{detailQuery.data.status}</Badge>}
          </DialogTitle>
        </DialogHeader>

        {detailQuery.isLoading && <LoadingState label="Loading contact" />}
        {detailQuery.isError && (
          <ErrorState onRetry={() => detailQuery.refetch()} message="Unable to load contact" />
        )}

        {detailQuery.data && (
          <Tabs defaultValue="overview">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-2 text-sm text-slate-700">
              <p className="font-semibold text-lg">{detailQuery.data.name}</p>
              <p>{detailQuery.data.email}</p>
              {detailQuery.data.phone && <p>{detailQuery.data.phone}</p>}
              {detailQuery.data.company && <p>Company: {detailQuery.data.company}</p>}
            </TabsContent>

            <TabsContent value="notes" className="space-y-2 text-sm text-slate-700">
              {detailQuery.data.notes ?? "No notes yet."}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-3">
              {(detailQuery.data.tasks ?? []).map((task) => (
                <div key={task.id} className="p-3 border rounded">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-slate-500">Status: {task.status}</p>
                </div>
              ))}
              {(detailQuery.data.tasks ?? []).length === 0 && <p className="text-sm text-slate-600">No tasks.</p>}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-3">
              {(detailQuery.data.timeline ?? []).map((item) => (
                <div key={item.id} className="p-3 border rounded">
                  <p className="text-sm text-slate-700">{item.message}</p>
                  <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {(detailQuery.data.timeline ?? []).length === 0 && (
                <p className="text-sm text-slate-600">No timeline events.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
