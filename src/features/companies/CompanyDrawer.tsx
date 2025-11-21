import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import http from "@/lib/http";
import { Badge } from "@/components/ui/badge";

interface Props {
  companyId: string;
  open: boolean;
  onClose: () => void;
}

interface CompanyDetail {
  id: string;
  name: string;
  industry?: string;
  employees?: number;
  annualRevenue?: number;
  contacts?: any[];
  applications?: any[];
  financials?: { metric: string; value: string }[];
  documents?: { id: string; name: string; status: string }[];
  notes?: string;
}

export default function CompanyDrawer({ companyId, open, onClose }: Props) {
  const detailQuery = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const res = await http.get<CompanyDetail>(`/api/companies/${companyId}`);
      return res.data;
    },
    enabled: open,
  });

  const tabs = useMemo(
    () => [
      "overview",
      "contacts",
      "applications",
      "financials",
      "documents",
      "notes",
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{detailQuery.data?.name ?? "Company"}</span>
            {detailQuery.data?.industry && <Badge variant="outline">{detailQuery.data.industry}</Badge>}
          </DialogTitle>
        </DialogHeader>

        {detailQuery.isLoading && <LoadingState label="Loading company" />}
        {detailQuery.isError && (
          <ErrorState onRetry={() => detailQuery.refetch()} message="Unable to load company" />
        )}

        {detailQuery.data && (
          <Tabs defaultValue="overview">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab[0].toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-1 text-sm text-slate-700">
              <p>Industry: {detailQuery.data.industry ?? "-"}</p>
              <p>Employees: {detailQuery.data.employees ?? "-"}</p>
              <p>Annual revenue: {detailQuery.data.annualRevenue ?? "-"}</p>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-2 text-sm">
              {(detailQuery.data.contacts ?? []).map((contact) => (
                <div key={contact.id} className="p-3 border rounded">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-slate-500">{contact.email}</p>
                </div>
              ))}
              {(detailQuery.data.contacts ?? []).length === 0 && <p>No contacts.</p>}
            </TabsContent>

            <TabsContent value="applications" className="space-y-2 text-sm">
              {(detailQuery.data.applications ?? []).map((app) => (
                <div key={app.id} className="p-3 border rounded">
                  <p className="font-medium">{app.name ?? app.id}</p>
                  <p className="text-xs text-slate-500">Stage: {app.stage ?? "-"}</p>
                </div>
              ))}
              {(detailQuery.data.applications ?? []).length === 0 && <p>No applications.</p>}
            </TabsContent>

            <TabsContent value="financials" className="space-y-2 text-sm">
              {(detailQuery.data.financials ?? []).map((fin) => (
                <div key={fin.metric} className="p-2 border rounded flex justify-between">
                  <span>{fin.metric}</span>
                  <span className="font-medium">{fin.value}</span>
                </div>
              ))}
              {(detailQuery.data.financials ?? []).length === 0 && <p>No financials.</p>}
            </TabsContent>

            <TabsContent value="documents" className="space-y-2 text-sm">
              {(detailQuery.data.documents ?? []).map((doc) => (
                <div key={doc.id} className="p-2 border rounded flex justify-between">
                  <span>{doc.name}</span>
                  <Badge variant="outline">{doc.status}</Badge>
                </div>
              ))}
              {(detailQuery.data.documents ?? []).length === 0 && <p>No documents.</p>}
            </TabsContent>

            <TabsContent value="notes" className="text-sm">
              {detailQuery.data.notes ?? "No notes."}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
