import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { listApplications } from "../core/endpoints/applications.api";
import { usePortalState } from "../core/view.store";

interface ApplicationRecord {
  id?: string;
  applicant?: string;
  product?: string;
  status?: string;
  amount?: number;
  owner?: string;
}

interface ApplicationListResponse {
  items?: ApplicationRecord[];
  data?: ApplicationRecord[];
}

const fallbackApplications: ApplicationRecord[] = [
  { id: "1", applicant: "Kai Nguyen", product: "Working capital", status: "Review", amount: 75000, owner: "Ashley Kim" },
  { id: "2", applicant: "Mia Rossi", product: "Credit line", status: "Decision", amount: 120000, owner: "Dev Patel" },
  { id: "3", applicant: "Liam Green", product: "Card", status: "Intake", amount: 15000, owner: "Morgan Lee" },
];

export default function ApplicationsPage() {
  const { timeframe } = usePortalState();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["applications", timeframe],
    queryFn: async () => (await listApplications<ApplicationListResponse>({ page: 1, perPage: 25, sort: timeframe })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const applications = useMemo(() => data?.items ?? data?.data ?? fallbackApplications, [data]);

  return (
    <PageLayout
      title="Applications"
      description="Decisioning work powered by the applications endpoint."
      badge="Workflows"
      actions={<Badge variant="outline">Sorted by: {timeframe}</Badge>}
    >
      <PageSection
        title="Current workload"
        description="Live feed from the new API layer"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Fetching" : "Updated"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Application list unavailable</CardTitle>
              <CardDescription>There was a problem connecting to the applications API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id ?? application.applicant}>
                  <TableCell className="font-semibold">{application.applicant}</TableCell>
                  <TableCell>{application.product}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{application.status}</Badge>
                  </TableCell>
                  <TableCell>{application.owner}</TableCell>
                  <TableCell>${application.amount?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>

      <PageSection title="At a glance" description="Quick summary of stage distribution.">
        <div className="grid gap-3 sm:grid-cols-3">
          {applications.map((application) => (
            <Card key={`${application.id}-summary`} className="border-indigo-100 bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">{application.applicant}</CardTitle>
                <CardDescription>{application.product}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="outline">{application.status}</Badge>
                <span className="font-semibold text-slate-900">${application.amount?.toLocaleString()}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </PageLayout>
  );
}
