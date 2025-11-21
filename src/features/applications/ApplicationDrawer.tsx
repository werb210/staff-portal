import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import DocumentPanel from "@/features/documents/DocumentPanel";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  fetchAiSummary,
  fetchBanking,
  fetchFinancials,
  fetchLenderRecommendations,
  sendToLender,
} from "./ApplicationDrawerService";
import { useApplicationFull } from "./useApplicationFull";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Props {
  appId: string;
  open: boolean;
  onClose: () => void;
  stage?: string;
}

const TAB_KEYS = ["summary", "banking", "financials", "documents", "lenders", "ai"] as const;

export default function ApplicationDrawer({ appId, open, onClose, stage }: Props) {
  const [params, setParams] = useSearchParams();
  const currentParam = params.get("tab") ?? "summary";
  const currentTab = TAB_KEYS.includes(currentParam as (typeof TAB_KEYS)[number])
    ? currentParam
    : "summary";

  function handleTabChange(value: string) {
    params.set("tab", value);
    setParams(params, { replace: true });
  }

  const summaryQuery = useApplicationFull(appId);

  const bankingQuery = useQuery({
    queryKey: ["banking", appId],
    queryFn: () => fetchBanking(appId),
    enabled: currentTab === "banking" && open,
    staleTime: 5 * 60 * 1000,
  });

  const financialsQuery = useQuery({
    queryKey: ["financials", appId],
    queryFn: () => fetchFinancials(appId),
    enabled: currentTab === "financials" && open,
    staleTime: 5 * 60 * 1000,
  });

  const lendersQuery = useQuery({
    queryKey: ["lenders", appId],
    queryFn: () => fetchLenderRecommendations(appId),
    enabled: currentTab === "lenders" && open,
    staleTime: 5 * 60 * 1000,
  });

  const aiSummaryQuery = useQuery({
    queryKey: ["ai-summary", appId],
    queryFn: () => fetchAiSummary(appId),
    enabled: currentTab === "ai" && open,
    staleTime: 5 * 60 * 1000,
  });

  const statusBadge = useMemo(() => {
    const map: Record<string, { label: string; variant: any }> = {
      new: { label: "New", variant: "outline" },
      requires_docs: { label: "Requires Docs", variant: "warning" },
      reviewing: { label: "Reviewing", variant: "outline" },
      ready_for_lenders: { label: "Ready for Lenders", variant: "success" },
      sent_to_lenders: { label: "Sent to Lenders", variant: "default" },
      funded: { label: "Funded", variant: "success" },
      closed_withdrawn: { label: "Closed / Withdrawn", variant: "secondary" },
    };
    return map[stage ?? ""] ?? { label: stage ?? "", variant: "outline" };
  }, [stage]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Application {appId}</p>
              <p className="text-2xl font-semibold">
                {summaryQuery.data?.businessName ?? "Application"}
              </p>
            </div>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed view with banking, financials, lenders, documents, and AI insights.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="banking">Banking</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="lenders">Lenders</TabsTrigger>
            <TabsTrigger value="ai">AI Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {summaryQuery.isLoading && <LoadingState label="Loading summary" />}
            {summaryQuery.isError && (
              <ErrorState onRetry={() => summaryQuery.refetch()} message="Unable to load application." />
            )}
            {summaryQuery.data && <SummaryTab data={summaryQuery.data} />}
          </TabsContent>

          <TabsContent value="banking">
            {bankingQuery.isLoading && <LoadingState label="Loading banking" />}
            {bankingQuery.isError && (
              <ErrorState onRetry={() => bankingQuery.refetch()} message="Failed to fetch banking" />
            )}
            {bankingQuery.data && <BankingTabContent data={bankingQuery.data} />}
          </TabsContent>

          <TabsContent value="financials">
            {financialsQuery.isLoading && <LoadingState label="Loading financials" />}
            {financialsQuery.isError && (
              <ErrorState
                onRetry={() => financialsQuery.refetch()}
                message="Failed to load financials"
              />
            )}
            {financialsQuery.data && <FinancialsTabContent data={financialsQuery.data} />}
          </TabsContent>

          <TabsContent value="documents">
            <DocumentPanel documentId={appId} />
          </TabsContent>

          <TabsContent value="lenders">
            {lendersQuery.isLoading && <LoadingState label="Loading lender matches" />}
            {lendersQuery.isError && (
              <ErrorState
                onRetry={() => lendersQuery.refetch()}
                message="Failed to load lenders"
              />
            )}
            {lendersQuery.data && <LendersTabContent appId={appId} data={lendersQuery.data} />}
          </TabsContent>

          <TabsContent value="ai">
            {aiSummaryQuery.isLoading && <LoadingState label="Loading AI summary" />}
            {aiSummaryQuery.isError && (
              <ErrorState onRetry={() => aiSummaryQuery.refetch()} message="Failed to load AI summary" />
            )}
            {aiSummaryQuery.data && <AiTabContent data={aiSummaryQuery.data} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SummaryTab({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Info</h3>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <InfoRow label="Business Name" value={data.businessName} />
          <InfoRow label="Industry" value={data.industry} />
          <InfoRow label="Years in Business" value={data.yearsInBusiness} />
          <InfoRow label="Revenue" value={data.revenue} />
        </div>

        <h3 className="text-lg font-semibold">Use of Funds</h3>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <InfoRow label="Requested Amount" value={data.amountRequested} />
          <InfoRow label="Purpose" value={data.useOfFunds} />
          <InfoRow label="Product" value={data.productType} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Owner Info</h3>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <InfoRow label="Owner Name" value={data.ownerName} />
          <InfoRow label="Email" value={data.ownerEmail} />
          <InfoRow label="Phone" value={data.ownerPhone} />
          <InfoRow label="Address" value={data.ownerAddress} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value ?? "—"}</span>
    </div>
  );
}

function BankingTabContent({ data }: { data: any }) {
  const deposits = [
    { label: "12m", value: data.totalDeposits12m },
    { label: "6m", value: data.totalDeposits6m },
    { label: "3m", value: data.totalDeposits3m },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h4 className="text-lg font-semibold">Balances</h4>
        <InfoRow label="NSFs" value={data.nsfs} />
        <InfoRow label="Avg Daily Balance" value={data.avgDailyBalance} />
        <InfoRow label="Highest Negative Balance" value={data.highestNegative} />
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h4 className="text-lg font-semibold">Total Deposits</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={deposits}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FinancialsTabContent({ data }: { data: any }) {
  const years = ["2022", "2023", "2024"];
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Line Item</th>
              {years.map((year) => (
                <th key={year} className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {data.lines?.map((line: any) => (
              <tr key={line.label} className={line.mismatch ? "bg-red-50" : undefined}>
                <td className="px-4 py-2 font-medium text-slate-900">{line.label}</td>
                {years.map((year) => (
                  <td key={year} className="px-4 py-2 text-slate-700">
                    {line[year] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LendersTabContent({ data, appId }: { data: any[]; appId: string }) {
  const { addToast } = useToast();

  async function handleSend(lenderId: string) {
    try {
      await sendToLender({ appId, lenderId });
      addToast({ title: "Lender sent", description: "Application shared", variant: "success" });
    } catch (err) {
      addToast({ title: "Send failed", description: String(err), variant: "destructive" });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.map((lender) => (
        <div key={lender.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{lender.productName}</p>
              <p className="text-sm text-slate-600">{lender.range}</p>
            </div>
            <Badge variant="success">{lender.matchScore}% match</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-700">{lender.summary}</p>
          <Button
            className="mt-3"
            onClick={() => handleSend(lender.id)}
          >
            Send to lender
          </Button>
        </div>
      ))}
    </div>
  );
}

function AiTabContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h4 className="text-lg font-semibold">Risk Summary</h4>
        <p className="text-sm text-slate-700">{data.risk}</p>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h4 className="text-lg font-semibold">Business Description</h4>
        <p className="text-sm text-slate-700">{data.description}</p>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h4 className="text-lg font-semibold">Missing Documents</h4>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          {data.missingDocs?.map((doc: string) => (
            <li key={doc}>{doc}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h4 className="text-lg font-semibold">Confidence</h4>
        <p className="text-sm font-semibold text-slate-900">{data.confidence}%</p>
      </div>
    </div>
  );
}
