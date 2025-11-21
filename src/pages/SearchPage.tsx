import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { search } from "../core/endpoints/search.api";
import { usePortalState } from "../core/view.store";

interface SearchResult {
  id?: string;
  title?: string;
  type?: string;
  owner?: string;
  snippet?: string;
}

interface SearchResponse {
  results?: SearchResult[];
  data?: SearchResult[];
}

const fallbackResults: SearchResult[] = [
  { id: "1", title: "New document upload", type: "Document", owner: "Ashley Kim", snippet: "OCR processing completed." },
  { id: "2", title: "Pipeline review", type: "Deal", owner: "Dev Patel", snippet: "Negotiation scheduled this week." },
  { id: "3", title: "User invite", type: "User", owner: "Morgan Lee", snippet: "Staff onboarding in progress." },
];

export default function SearchPage() {
  const { searchTerm, setSearchTerm } = usePortalState();
  const queryValue = searchTerm || "staff portal";

  const { data, isError, isLoading } = useQuery({
    queryKey: ["search", queryValue],
    queryFn: async () => (await search<SearchResponse>({ query: queryValue, scope: "all" })).data,
    staleTime: 10_000,
    retry: 1,
  });

  const results = useMemo(() => data?.results ?? data?.data ?? fallbackResults, [data]);

  return (
    <PageLayout
      title="Search"
      description="Unified search calling the dedicated search endpoint."
      badge="Discovery"
      actions={
        <Input
          placeholder="Search everything"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-72"
        />
      }
    >
      <PageSection
        title="Results"
        description={`Query: "${queryValue}"`}
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Searching" : "Complete"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Search unavailable</CardTitle>
              <CardDescription>The search API could not be reached.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id ?? result.title}>
                  <TableCell className="font-semibold">{result.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{result.type}</Badge>
                  </TableCell>
                  <TableCell>{result.owner}</TableCell>
                  <TableCell>{result.snippet}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>
    </PageLayout>
  );
}
