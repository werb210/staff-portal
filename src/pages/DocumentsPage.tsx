import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { listDocuments } from "../core/endpoints/documents.api";
import { usePortalState } from "../core/view.store";

interface DocumentRecord {
  id?: string;
  title?: string;
  type?: string;
  owner?: string;
  tags?: string[];
  status?: string;
}

interface DocumentListResponse {
  items?: DocumentRecord[];
  data?: DocumentRecord[];
}

const fallbackDocuments: DocumentRecord[] = [
  { id: "1", title: "KYB packet", type: "PDF", owner: "Ashley Kim", tags: ["Compliance"], status: "Verified" },
  { id: "2", title: "Financial statements", type: "XLSX", owner: "Dev Patel", tags: ["Finance", "Q3"], status: "Pending" },
  { id: "3", title: "Identity check", type: "Image", owner: "Morgan Lee", tags: ["KYC"], status: "Processing" },
];

export default function DocumentsPage() {
  const { timeframe } = usePortalState();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["documents", timeframe],
    queryFn: async () => (await listDocuments<DocumentListResponse>({ page: 1, perPage: 20, search: timeframe })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const documents = useMemo(() => data?.items ?? data?.data ?? fallbackDocuments, [data]);

  return (
    <PageLayout
      title="Documents"
      description="OCR-ready document management connected to the API."
      badge="Compliance"
      actions={<Badge variant="outline">Window: {timeframe}</Badge>}
    >
      <PageSection
        title="Repository"
        description="Documents fetched with react-query"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Loading" : "Ready"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Documents unavailable</CardTitle>
              <CardDescription>Unable to pull documents from the API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id ?? document.title}>
                  <TableCell className="font-semibold">{document.title}</TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.status}</Badge>
                  </TableCell>
                  <TableCell>{document.owner}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {document.tags?.map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
