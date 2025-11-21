import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { listTags } from "../core/endpoints/tags.api";

interface TagRecord {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
}

interface TagListResponse {
  items?: TagRecord[];
  data?: TagRecord[];
}

const fallbackTags: TagRecord[] = [
  { id: "1", name: "Priority", description: "Needs fast review", color: "emerald" },
  { id: "2", name: "Compliance", description: "Regulatory checks", color: "indigo" },
  { id: "3", name: "Watchlist", description: "Monitor updates", color: "amber" },
];

export default function TagsPage() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await listTags<TagListResponse>()).data,
    staleTime: 60_000,
    retry: 1,
  });

  const tags = useMemo(() => data?.items ?? data?.data ?? fallbackTags, [data]);

  return (
    <PageLayout
      title="Tags"
      description="Taxonomy pulled directly from the tags endpoint."
      badge="Taxonomy"
      actions={<Badge variant="outline">API driven</Badge>}
    >
      <PageSection
        title="Available tags"
        description="Categorization synced via react-query"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Loading" : "Ready"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Tags unavailable</CardTitle>
              <CardDescription>Unable to pull tags from the API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id ?? tag.name}>
                  <TableCell className="font-semibold">{tag.name}</TableCell>
                  <TableCell>{tag.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tag.color}</Badge>
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
