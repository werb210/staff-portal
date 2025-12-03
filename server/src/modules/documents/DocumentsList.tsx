import { useEffect } from "react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { DocumentRecord } from "./documents.api";

interface DocumentsListProps {
  applicationId: string;
  documents: DocumentRecord[];
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  selectedDocumentId?: string | null;
  onSelect?: (document: DocumentRecord) => void;
}

export default function DocumentsList({
  applicationId,
  documents,
  isLoading,
  isError,
  onRefresh,
  selectedDocumentId,
  onSelect,
}: DocumentsListProps) {
  useEffect(() => {
    if (!selectedDocumentId && documents.length && onSelect) {
      onSelect(documents[0]);
    }
  }, [documents, onSelect, selectedDocumentId]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Application documents</CardTitle>
          <CardDescription>Documents scoped to application ID {applicationId}.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Syncing" : "Current"}</Badge>
          <Button size="sm" variant="secondary" onClick={onRefresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to fetch documents for this application. Please retry.
          </div>
        ) : documents.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => {
                const isSelected = selectedDocumentId === document.id;

                return (
                  <TableRow
                    key={document.id}
                    className={isSelected ? "bg-indigo-50" : undefined}
                    onClick={() => onSelect?.(document)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isSelected ? <Badge variant="default">Active</Badge> : null}
                        {document.name ?? document.title ?? "Untitled document"}
                      </div>
                    </TableCell>
                    <TableCell>{document.type ?? "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.status ?? "Uploaded"}</Badge>
                    </TableCell>
                    <TableCell>{document.pageCount ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-slate-600">
                        <span>{document.uploadedAt ?? "Pending"}</span>
                        <span className="text-slate-500">{document.uploadedBy ?? "Automated"}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-500">
            No documents found for this application yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
