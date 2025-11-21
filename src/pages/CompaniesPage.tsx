import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { listCompanies } from "../core/endpoints/companies.api";
import { usePortalState } from "../core/view.store";

interface CompanyRecord {
  id?: string;
  name?: string;
  industry?: string;
  region?: string;
  owner?: string;
  size?: string;
}

interface CompanyListResponse {
  items?: CompanyRecord[];
  data?: CompanyRecord[];
}

const fallbackCompanies: CompanyRecord[] = [
  { id: "1", name: "Northwind", industry: "Logistics", region: "NA", owner: "Ashley Kim", size: "201-500" },
  { id: "2", name: "Lighthouse", industry: "Fintech", region: "EU", owner: "Dev Patel", size: "51-200" },
  { id: "3", name: "Aurora", industry: "Energy", region: "APAC", owner: "Morgan Lee", size: "501-1k" },
];

export default function CompaniesPage() {
  const { searchTerm, setSearchTerm } = usePortalState();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["companies", searchTerm],
    queryFn: async () => (await listCompanies<CompanyListResponse>({ search: searchTerm || undefined })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const companies = useMemo(() => data?.items ?? data?.data ?? fallbackCompanies, [data]);

  return (
    <PageLayout
      title="Companies"
      description="Organization records powered by the companies endpoint."
      badge="Entities"
      actions={
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search companies"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-64"
          />
          <Button variant="secondary" onClick={() => setSearchTerm("")}>Reset</Button>
        </div>
      }
    >
      <PageSection
        title="Organizations"
        description="Fetched from the new API layer"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Syncing" : "Ready"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>API unavailable</CardTitle>
              <CardDescription>Company records could not be loaded.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id ?? company.name}>
                  <TableCell className="font-semibold">{company.name}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>{company.region}</TableCell>
                  <TableCell>{company.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{company.size}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>
    </PageLayout>
  );
}
