import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { getPipelineSummary, listPipelineItems } from "../core/endpoints/pipeline.api";
import { usePortalState } from "../core/view.store";

interface PipelineSummaryItem {
  stage?: string;
  count?: number;
  value?: number;
}

interface PipelineItem {
  id?: string;
  name?: string;
  stage?: string;
  owner?: string;
  value?: number;
}

interface PipelineSummaryResponse {
  stages?: PipelineSummaryItem[];
}

interface PipelineListResponse {
  items?: PipelineItem[];
  data?: PipelineItem[];
}

const fallbackSummary: PipelineSummaryItem[] = [
  { stage: "Intake", count: 18, value: 120000 },
  { stage: "Review", count: 12, value: 96000 },
  { stage: "Decision", count: 9, value: 74000 },
];

const fallbackItems: PipelineItem[] = [
  { id: "1", name: "Redwood expansion", stage: "Review", owner: "Ashley Kim", value: 32000 },
  { id: "2", name: "Atlas renewal", stage: "Decision", owner: "Dev Patel", value: 28000 },
  { id: "3", name: "Summit pilot", stage: "Intake", owner: "Morgan Lee", value: 18000 },
];

export default function PipelinePage() {
  const { timeframe } = usePortalState();

  const { data: summaryData, isError: summaryError, isLoading: summaryLoading } = useQuery({
    queryKey: ["pipeline-summary", timeframe],
    queryFn: async () => (await getPipelineSummary<PipelineSummaryResponse>({ timeframe })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const { data: itemsData, isError: itemsError, isLoading: itemsLoading } = useQuery({
    queryKey: ["pipeline-items", timeframe],
    queryFn: async () => (await listPipelineItems<PipelineListResponse>({ timeframe })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const summary = useMemo(() => summaryData?.stages ?? fallbackSummary, [summaryData]);
  const items = useMemo(() => itemsData?.items ?? itemsData?.data ?? fallbackItems, [itemsData]);

  return (
    <PageLayout
      title="Pipeline"
      description="End-to-end pipeline view sourced from the pipeline endpoints."
      badge="Operations"
      actions={<Badge variant="outline">Timeframe: {timeframe}</Badge>}
    >
      <PageSection
        title="Stage summary"
        description="Snapshot powered by the summary endpoint"
        toolbar={<Badge variant={summaryLoading ? "warning" : "success"}>{summaryLoading ? "Syncing" : "Current"}</Badge>}
      >
        {summaryError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Pipeline summary unavailable</CardTitle>
              <CardDescription>Unable to retrieve pipeline stages from the API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {summary.map((stage) => (
              <Card key={stage.stage} className="border-indigo-100 bg-white/80">
                <CardHeader>
                  <CardTitle className="text-base">{stage.stage}</CardTitle>
                  <CardDescription>{stage.count} records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">${stage.value?.toLocaleString()}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection
        title="Workload"
        description="Individual items streamed from the pipeline items endpoint"
        toolbar={<Badge variant={itemsLoading ? "warning" : "success"}>{itemsLoading ? "Loading" : "Ready"}</Badge>}
      >
        {itemsError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Pipeline items unavailable</CardTitle>
              <CardDescription>Unable to load items from the API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id ?? item.name}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.stage}</Badge>
                  </TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>${item.value?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>
    </PageLayout>
  );
}
