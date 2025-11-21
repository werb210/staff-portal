import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { listDeals } from "../core/endpoints/deals.api";
import { usePortalState } from "../core/view.store";

interface DealRecord {
  id?: string;
  name?: string;
  value?: number;
  stage?: string;
  company?: string;
  owner?: string;
}

interface DealListResponse {
  items?: DealRecord[];
  data?: DealRecord[];
}

const fallbackDeals: DealRecord[] = [
  { id: "1", name: "Redwood expansion", value: 120000, stage: "Discovery", company: "Northwind", owner: "Ashley Kim" },
  { id: "2", name: "Atlas renewal", value: 84000, stage: "Negotiation", company: "Lighthouse", owner: "Dev Patel" },
  { id: "3", name: "Summit pilot", value: 56000, stage: "Proposal", company: "Aurora", owner: "Morgan Lee" },
];

export default function DealsPage() {
  const { timeframe } = usePortalState();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["deals", timeframe],
    queryFn: async () => (await listDeals<DealListResponse>({ sort: timeframe })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const deals = useMemo(() => data?.items ?? data?.data ?? fallbackDeals, [data]);

  return (
    <PageLayout
      title="Deals"
      description="Pipeline collaboration driven by the deals endpoint."
      badge="Pipeline"
      actions={<Badge variant="outline">Timeframe: {timeframe}</Badge>}
    >
      <PageSection
        title="Active deals"
        description="Real-time view of stage progression"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Syncing" : "Current"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Deal stream unavailable</CardTitle>
              <CardDescription>Unable to reach the deals API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id ?? deal.name}>
                  <TableCell className="font-semibold">{deal.name}</TableCell>
                  <TableCell>{deal.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{deal.stage}</Badge>
                  </TableCell>
                  <TableCell>{deal.owner}</TableCell>
                  <TableCell>${deal.value?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>

      <PageSection title="Stage heatmap" description="Quick reference for where work is clustering.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <Card key={`${deal.id}-summary`} className="border-indigo-100 bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">{deal.name}</CardTitle>
                <CardDescription>{deal.company}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="outline">{deal.stage}</Badge>
                <span className="font-semibold text-slate-900">${deal.value?.toLocaleString()}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </PageLayout>
  );
}
