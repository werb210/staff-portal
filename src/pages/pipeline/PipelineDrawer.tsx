import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DrawerSkeleton } from "@/ui/skeletons";
import { PipelineCard as PipelineCardType } from "@/features/pipeline/PipelineTypes";
import { getApplicationDetails } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface PipelineDrawerProps {
  appId: string | null;
  open: boolean;
  onClose: () => void;
}

const tabs = ["application", "banking", "financials", "documents", "lenders"] as const;

function formatTimeSince(updatedAt?: string) {
  if (!updatedAt) return "Unknown";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

function DetailRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value ?? "—"}</span>
    </div>
  );
}

export default function PipelineDrawer({ appId, open, onClose }: PipelineDrawerProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("application");
  const { addToast } = useToast();

  useEffect(() => {
    setTab("application");
  }, [appId]);

  const detailsQuery = useQuery<PipelineCardType, Error>({
    queryKey: ["application-detail", appId],
    queryFn: () => getApplicationDetails(appId ?? ""),
    enabled: open && Boolean(appId),
    onError: (error) =>
      addToast({ title: "Unable to load application", description: error.message, variant: "destructive" }),
  });

  const application = detailsQuery.data;
  const amountFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent className="max-w-3xl">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Application</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {application?.businessName ?? "Application details"}
            </h2>
            {application && <p className="text-sm text-slate-600">{application.contactName}</p>}
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="px-6 py-4">
          {detailsQuery.isLoading && <DrawerSkeleton />}

          {!detailsQuery.isLoading && !application && (
            <p className="text-sm text-slate-600">Select an application to view details.</p>
          )}

          {application && (
            <Tabs value={tab} onValueChange={(value) => setTab(value as (typeof tabs)[number])}>
              <TabsList className="mb-4 flex flex-wrap gap-2">
                {tabs.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="application">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <DetailRow label="Business" value={application.businessName} />
                    <DetailRow label="Primary contact" value={application.contactName} />
                    <DetailRow label="Product type" value={application.productType} />
                    <DetailRow
                      label="Requested amount"
                      value={amountFormatter.format(application.amountRequested)}
                    />
                    <DetailRow label="Last activity" value={formatTimeSince(application.updatedAt)} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="banking">
                <Card>
                  <CardHeader>
                    <CardTitle>Banking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <DetailRow label="Status" value={application.bankingStatus ?? "Not connected"} />
                    <p className="text-sm text-slate-600">Review banking connections and data health.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials">
                <Card>
                  <CardHeader>
                    <CardTitle>Financials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Financial statements and metrics will appear here once available.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Track uploaded documents and outstanding requests for this application.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lenders">
                <Card>
                  <CardHeader>
                    <CardTitle>Lenders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-600">Assigned lenders and offers will display in this tab.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
