import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { getDashboardOverview } from "../core/endpoints/dashboard.api";
import { usePortalState } from "../core/view.store";

type BadgeVariant = "default" | "success" | "warning" | "outline";

interface DashboardMetric {
  label: string;
  value: number;
  change: string;
  intent?: "positive" | "negative" | "neutral";
}

interface DashboardHighlight {
  title: string;
  owner: string;
  status: string;
}

interface DashboardPipelineItem {
  stage: string;
  count: number;
  value: number;
}

interface DashboardOverview {
  metrics?: DashboardMetric[];
  highlights?: DashboardHighlight[];
  pipeline?: DashboardPipelineItem[];
}

const fallbackOverview: DashboardOverview = {
  metrics: [
    { label: "Active contacts", value: 248, change: "+6%", intent: "positive" },
    { label: "In-flight deals", value: 42, change: "+2%", intent: "positive" },
    { label: "Applications", value: 118, change: "-4%", intent: "negative" },
    { label: "Documents", value: 312, change: "+8%", intent: "positive" },
  ],
  highlights: [
    { title: "Weekly onboarding cohort ready for review", owner: "Ashley Kim", status: "On track" },
    { title: "Auto-tagging enabled for new uploads", owner: "Dev Patel", status: "Adopted" },
    { title: "Reminder: pipeline retro with deal desk", owner: "Morgan Lee", status: "Upcoming" },
  ],
  pipeline: [
    { stage: "Intake", count: 36, value: 240000 },
    { stage: "Review", count: 22, value: 180000 },
    { stage: "Decision", count: 14, value: 120000 },
  ],
};

export default function DashboardPage() {
  const { timeframe, setTimeframe } = usePortalState();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-overview", timeframe],
    queryFn: async () => (await getDashboardOverview<DashboardOverview>({ timeframe })).data,
    staleTime: 60_000,
    retry: 1,
  });

  const overview = data ?? fallbackOverview;

  const metricsByIntent = useMemo<(DashboardMetric & { badgeVariant: BadgeVariant })[]>(
    () =>
      overview.metrics?.map((metric) => ({
        ...metric,
        badgeVariant: metric.intent === "positive" ? "success" : metric.intent === "negative" ? "warning" : "default",
      })) ?? [],
    [overview.metrics],
  );

  return (
    <PageLayout
      title="Dashboard"
      description="Live operational overview pulling from the new API layer."
      badge="New layout"
      actions={[
        "7d",
        "30d",
        "90d",
      ].map((range) => (
        <Button
          key={range}
          variant={range === timeframe ? "primary" : "secondary"}
          size="sm"
          onClick={() => setTimeframe(range as "7d" | "30d" | "90d")}
        >
          {range}
        </Button>
      ))}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsByIntent.map((metric) => (
          <Card key={metric.label} className="border-indigo-100 bg-white/80 shadow-sm">
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={metric.badgeVariant}>{metric.change} vs prior period</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <PageSection
        title="Operational highlights"
        description="Cross-team updates streamed from the API layer."
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Refreshing" : "Synced"}</Badge>}
      >
        {isError ? (
          <p className="text-sm text-red-600">Unable to load highlights right now.</p>
        ) : (
          <ul className="space-y-3">
            {overview.highlights?.map((item) => (
              <li
                key={`${item.title}-${item.owner}`}
                className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">Owner: {item.owner}</p>
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </PageSection>

      <PageSection title="Pipeline preview" description="Snapshot of active work across stages.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overview.pipeline?.map((item) => (
              <TableRow key={item.stage}>
                <TableCell className="font-medium">{item.stage}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>${item.value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageSection>
    </PageLayout>
  );
}
