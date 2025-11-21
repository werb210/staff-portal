import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { getReportsOverview } from "../core/endpoints/reports.api";
import { usePortalState } from "../core/view.store";

interface ReportInsight {
  label?: string;
  value?: string;
  trend?: string;
}

interface ReportsOverviewResponse {
  highlights?: ReportInsight[];
  benchmarks?: ReportInsight[];
}

const fallbackOverview: ReportsOverviewResponse = {
  highlights: [
    { label: "Conversion rate", value: "32%", trend: "+2.4%" },
    { label: "Average review time", value: "18h", trend: "-1.2h" },
    { label: "Approval volume", value: "64", trend: "+8" },
  ],
  benchmarks: [
    { label: "NPS", value: "72", trend: "+3" },
    { label: "SLA met", value: "94%", trend: "+1%" },
    { label: "Docs auto-cleared", value: "68%", trend: "+5%" },
  ],
};

export default function ReportsPage() {
  const { timeframe } = usePortalState();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["reports", timeframe],
    queryFn: async () => (await getReportsOverview<ReportsOverviewResponse>({ timeframe })).data,
    staleTime: 60_000,
    retry: 1,
  });

  const overview = useMemo(() => data ?? fallbackOverview, [data]);

  return (
    <PageLayout
      title="Reports"
      description="Insights delivered through the reports endpoint."
      badge="Insights"
      actions={<Badge variant="outline">Period: {timeframe}</Badge>}
    >
      <PageSection
        title="Highlights"
        description="Metrics refreshed from the API"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Refreshing" : "Live"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Reports unavailable</CardTitle>
              <CardDescription>Unable to load metrics from the API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.highlights?.map((item) => (
                <TableRow key={item.label}>
                  <TableCell className="font-semibold">{item.label}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.trend}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>

      <PageSection title="Benchmarks" description="Operational guardrails and targets.">
        <div className="grid gap-3 sm:grid-cols-3">
          {overview.benchmarks?.map((item) => (
            <Card key={item.label} className="border-indigo-100 bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <CardDescription>Target vs actual</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{item.value}</span>
                <Badge variant="outline">{item.trend}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </PageLayout>
  );
}
