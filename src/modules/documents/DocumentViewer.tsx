import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { cn } from "../../lib/utils";
import { BankingAnalysis, DocumentRecord, OcrField, fetchOcrReport } from "./documents.api";

interface DocumentViewerProps {
  document?: DocumentRecord | null;
}

const placeholderFields: OcrField[] = [
  { label: "Entity Name", value: "Acme Manufacturing LLC", confidence: 0.98 },
  { label: "Tax ID", value: "99-1029384", confidence: 0.92 },
  { label: "Annual Revenue", value: "$2.4M", confidence: 0.87 },
  { label: "Owner", value: "Casey Lee", confidence: 0.94 },
];

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const hasDocument = Boolean(document?.id);

  const { data: ocrData, isLoading: isOcrLoading, isError: ocrError } = useQuery({
    queryKey: ["ocr", document?.id],
    queryFn: async () => (await fetchOcrReport(document!.id)).data,
    enabled: hasDocument,
    staleTime: 30_000,
  });

  const resolvedFields = useMemo(() => ocrData?.fields ?? placeholderFields, [ocrData?.fields]);
  const matchedProducts = useMemo(() => ocrData?.matchedProducts ?? [], [ocrData?.matchedProducts]);
  const errors = useMemo(() => ocrData?.errors ?? [], [ocrData?.errors]);
  const warnings = useMemo(() => ocrData?.warnings ?? [], [ocrData?.warnings]);
  const banking = useMemo<BankingAnalysis>(() => ocrData?.bankingAnalysis ?? {}, [ocrData?.bankingAnalysis]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{document?.name ?? document?.title ?? "Select a document"}</CardTitle>
          <CardDescription>
            {document?.applicationId ? `Application ${document.applicationId}` : "Choose a document to view preview and OCR results."}
          </CardDescription>
          {document?.status ? <Badge variant="outline">{document.status}</Badge> : null}
        </div>
        {document?.s3Url ? (
          <Button asChild variant="secondary">
            <a href={document.s3Url} target="_blank" rel="noreferrer">
              Open in S3
            </a>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasDocument ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-500">
            Select a document from the list to view it.
          </div>
        ) : null}

        {hasDocument ? (
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="ocr">OCR & Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              {document?.s3Url ? (
                <iframe
                  title={document?.name ?? document?.title ?? "Document preview"}
                  src={document.s3Url}
                  className="h-[420px] w-full rounded-lg border border-slate-200"
                />
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-500">
                  No S3 preview URL available for this document.
                </div>
              )}
            </TabsContent>

            <TabsContent value="ocr" className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                {isOcrLoading ? <Badge variant="warning">Loading OCR</Badge> : <Badge variant="success">Latest OCR</Badge>}
                {ocrError ? <Badge variant="warning">Failed to load OCR</Badge> : null}
                <Badge variant="outline">Errors: {errors.length}</Badge>
                <Badge variant="outline">Warnings: {warnings.length}</Badge>
              </div>

              {!ocrData && !isOcrLoading ? (
                <p className="text-xs text-slate-500">No OCR payload returned yet; placeholder fields are shown.</p>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">OCR fields</CardTitle>
                    <CardDescription>Structured extraction from the latest OCR job.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead className="text-right">Confidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resolvedFields.map((field) => (
                          <TableRow key={field.label}>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>{field.value}</TableCell>
                            <TableCell className="text-right text-xs text-slate-500">
                              {field.confidence ? `${Math.round(field.confidence * 100)}%` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Banking analysis</CardTitle>
                    <CardDescription>Derived metrics from the bank statement OCR.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <Metric label="Monthly revenue" value={banking.monthlyRevenue ?? "Not available"} />
                      <Metric label="Average balance" value={banking.averageBalance ?? "Not available"} />
                      <Metric label="NSF count" value={banking.nsfCount ?? "0"} />
                      <Metric label="Cash flow score" value={banking.cashFlowScore ?? "-"} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Matched lender products</CardTitle>
                  <CardDescription>Products mapped from OCR data and eligibility rules.</CardDescription>
                </CardHeader>
                <CardContent>
                  {matchedProducts.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Lender</TableHead>
                          <TableHead className="text-right">Match</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchedProducts.map((product) => (
                          <TableRow key={`${product.id ?? product.name}-${product.lender}`}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.lender}</TableCell>
                            <TableCell className="text-right text-xs text-slate-500">
                              {product.matchScore ? `${Math.round(product.matchScore * 100)}%` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-slate-600">No lender matches found yet.</div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Errors</CardTitle>
                    <CardDescription>Anything blocking OCR post-processing.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertList entries={errors} emptyMessage="No OCR errors detected." />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Warnings</CardTitle>
                    <CardDescription>Quality issues that may need review.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertList entries={warnings} emptyMessage="No warnings for this document." tone="warning" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function AlertList({
  entries,
  emptyMessage,
  tone = "error",
}: {
  entries: string[];
  emptyMessage: string;
  tone?: "error" | "warning";
}) {
  if (!entries.length) {
    return <div className="text-sm text-slate-600">{emptyMessage}</div>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {entries.map((entry) => (
        <li
          key={entry}
          className={cn(
            "rounded-lg border p-3",
            tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {entry}
        </li>
      ))}
    </ul>
  );
}
